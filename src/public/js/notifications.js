document.addEventListener('DOMContentLoaded', () => {
  // Загружаем сохраненные напоминания
  let reminders = JSON.parse(localStorage.getItem('carReminders')) || [];
  
  const serviceTypeSelect = document.getElementById('serviceType');
  const customServiceInput = document.getElementById('customService');
  const reminderDateInput = document.getElementById('reminderDate');
  const reminderKmInput = document.getElementById('reminderKm');
  const priorityLevelSelect = document.getElementById('priorityLevel');
  const addReminderBtn = document.getElementById('addReminderBtn');

  // Показать/скрыть поле "другое"
  serviceTypeSelect.addEventListener('change', () => {
    if (serviceTypeSelect.value === 'custom') {
      customServiceInput.style.display = 'block';
      customServiceInput.required = true;
    } else {
      customServiceInput.style.display = 'none';
      customServiceInput.required = false;
    }
  });

  // Добавление нового напоминания
  addReminderBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    const serviceType = serviceTypeSelect.value;
    const customService = customServiceInput.value;
    const reminderDate = reminderDateInput.value;
    const reminderKm = reminderKmInput.value;
    const priority = priorityLevelSelect.value;

    // Проверка обязательных полей
    if (!serviceType) {
      showErrorMessage('Пожалуйста, выберите тип обслуживания');
      return;
    }
    
    if (serviceType === 'custom' && !customService.trim()) {
      showErrorMessage('Пожалуйста, укажите тип работ');
      return;
    }
    
    if (!reminderDate) {
      showErrorMessage('Пожалуйста, выберите дату напоминания');
      return;
    }

    const serviceName = serviceType === 'custom' ? customService.trim() : getServiceName(serviceType);
    const newReminder = {
      id: Date.now(),
      service: serviceName,
      date: reminderDate,
      km: reminderKm || null,
      priority: priority,
      status: 'active',
      created: new Date().toISOString()
    };

    reminders.push(newReminder);
    localStorage.setItem('carReminders', JSON.stringify(reminders));
    
    // Очистка формы
    serviceTypeSelect.value = '';
    customServiceInput.value = '';
    customServiceInput.style.display = 'none';
    reminderDateInput.value = '';
    reminderKmInput.value = '';
    priorityLevelSelect.value = 'low';

    // Обновление списка напоминаний
    updateNotificationsList();
    
    // Показать уведомление об успешном добавлении
    showSuccessMessage('Напоминание успешно добавлено!');
  });

  // Функция получения названия сервиса
  function getServiceName(type) {
    const serviceNames = {
      'to': 'Техническое обслуживание',
      'oil': 'Замена масла',
      'brakes': 'Замена тормозных колодок',
      'tires': 'Замена шин',
      'battery': 'Замена аккумулятора',
      'filters': 'Замена фильтров',
      'coolant': 'Замена охлаждающей жидкости'
    };
    return serviceNames[type] || type;
  }

  // Обновление списка напоминаний
  function updateNotificationsList() {
    const notificationsList = document.querySelector('.notifications-list');
    if (!notificationsList) return;

    // Очищаем существующие напоминания (кроме статичных)
    const dynamicNotifications = notificationsList.querySelectorAll('.notification-card.dynamic');
    dynamicNotifications.forEach(notification => notification.remove());

    // Добавляем новые напоминания
    reminders.forEach(reminder => {
      if (reminder.status === 'active') {
        const notificationCard = createNotificationCard(reminder);
        notificationsList.appendChild(notificationCard);
      }
    });
  }

  // Создание карточки напоминания
  function createNotificationCard(reminder) {
    const card = document.createElement('div');
    card.className = `notification-card ${reminder.priority} dynamic`;
    
    const daysUntil = calculateDaysUntil(reminder.date);
    const emoji = getServiceEmoji(reminder.service);
    
    card.innerHTML = `
      <div class="notification-date">${daysUntil}</div>
      <div class="notification-info">
        <h3>${emoji} ${reminder.service}</h3>
        <p>Запланировано на ${new Date(reminder.date).toLocaleDateString('ru-RU')}</p>
        <div class="notification-details">
          <span class="service-type">${getPriorityText(reminder.priority)}</span>
          <span class="notification-status">Активно</span>
        </div>
      </div>
      <button class="notification-action" onclick="completeReminder(${reminder.id})">Выполнено</button>
    `;

    return card;
  }

  // Расчет дней до напоминания
  function calculateDaysUntil(dateString) {
    const reminderDate = new Date(dateString);
    const today = new Date();
    const diffTime = reminderDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Просрочено';
    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Завтра';
    if (diffDays < 7) return `${diffDays} дней`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед.`;
    return `${Math.floor(diffDays / 30)} мес.`;
  }

  // Получение эмодзи для типа сервиса
  function getServiceEmoji(service) {
    const emojis = {
      'Техническое обслуживание': '🔧',
      'Замена масла': '🛢️',
      'Замена тормозных колодок': '🚗',
      'Замена шин': '🛞',
      'Замена аккумулятора': '🔋',
      'Замена фильтров': '🌬️',
      'Замена охлаждающей жидкости': '❄️'
    };
    return emojis[service] || '🔧';
  }

  // Получение текста приоритета
  function getPriorityText(priority) {
    const priorities = {
      'low': 'Низкий приоритет',
      'medium': 'Средний приоритет',
      'high': 'Высокий приоритет'
    };
    return priorities[priority] || priority;
  }

  // Отметка напоминания как выполненного
  window.completeReminder = function(id) {
    const reminderIndex = reminders.findIndex(r => r.id === id);
    if (reminderIndex !== -1) {
      reminders[reminderIndex].status = 'completed';
      reminders[reminderIndex].completedDate = new Date().toISOString();
      localStorage.setItem('carReminders', JSON.stringify(reminders));
      
      updateNotificationsList();
      updateHistoryList();
      showSuccessMessage('Напоминание отмечено как выполненное!');
    }
  };

  // Обновление списка истории
  function updateHistoryList() {
    const historyList = document.querySelector('.history-list');
    if (!historyList) return;

    // Добавляем выполненные напоминания в историю
    const completedReminders = reminders.filter(r => r.status === 'completed');
    completedReminders.forEach(reminder => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      
      historyItem.innerHTML = `
        <div class="history-date">${new Date(reminder.completedDate).toLocaleDateString('ru-RU')}</div>
        <div class="history-info">
          <h4>${reminder.service}</h4>
          <p>Выполнено согласно напоминанию</p>
        </div>
        <div class="history-status completed">Выполнено</div>
      `;

      // Добавляем в начало списка
      historyList.insertBefore(historyItem, historyList.firstChild);
    });
  }

  // Показать сообщение об успехе
  function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    // Добавляем анимацию
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(successDiv);

    // Удаляем сообщение через 3 секунды
    setTimeout(() => {
      successDiv.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv);
        }
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      }, 300);
    }, 3000);
  }

  // Показать сообщение об ошибке
  function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(errorDiv);

    // Удаляем сообщение через 4 секунды
    setTimeout(() => {
      errorDiv.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => {
        if (document.body.contains(errorDiv)) {
          document.body.removeChild(errorDiv);
        }
      }, 300);
    }, 4000);
  }

  // Обработчики для существующих кнопок
  const notificationActions = document.querySelectorAll('.notification-action');
  notificationActions.forEach(button => {
    button.addEventListener('click', () => {
      const card = button.closest('.notification-card');
      const title = card.querySelector('h3').textContent;
      
      if (button.textContent === 'Выполнено') {
        card.style.opacity = '0.5';
        button.disabled = true;
        button.textContent = 'Выполнено ✓';
        showSuccessMessage(`"${title}" отмечено как выполненное!`);
      }
    });
  });

  // Установка минимальной даты (сегодня)
  const today = new Date().toISOString().split('T')[0];
  reminderDateInput.min = today;

  // Инициализация
  updateNotificationsList();
}); 