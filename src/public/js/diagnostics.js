document.addEventListener('DOMContentLoaded', () => {
  // Симуляция получения данных диагностики
  const diagnosticsData = {
    emergency: {
      'engine-check': {
        status: 'critical',
        lastUpdate: new Date(),
        description: 'Обнаружены проблемы с двигателем'
      },
      'headlight-warning': {
        status: 'warning',
        lastUpdate: new Date(),
        description: 'Неисправность левой фары'
      }
    },
    regular: {
      'oil-level': {
        status: 'medium',
        value: '60%',
        lastUpdate: new Date()
      },
      'washer-fluid': {
        status: 'low',
        value: '25%',
        lastUpdate: new Date()
      },
      'battery-status': {
        status: 'good',
        value: '85%',
        lastUpdate: new Date()
      },
      'tire-pressure': {
        status: 'normal',
        value: 'Все в норме',
        lastUpdate: new Date()
      }
    }
  };

  // Обновление индикаторов в реальном времени
  function updateIndicators() {
    const emergencyIndicators = document.querySelectorAll('.emergency-indicator');
    emergencyIndicators.forEach(indicator => {
      indicator.style.animation = 'pulse-red 2s infinite';
    });

    // Случайное обновление статусов (симуляция)
    const regularItems = document.querySelectorAll('.notification-item.regular');
    regularItems.forEach(item => {
      const indicator = item.querySelector('.regular-indicator');
      if (Math.random() > 0.8) {
        indicator.style.background = Math.random() > 0.5 ? '#f59e0b' : '#059669';
      }
    });
  }

  // Интерактивность уведомлений
  const notificationItems = document.querySelectorAll('.notification-item');
  notificationItems.forEach(item => {
    item.addEventListener('click', () => {
      const title = item.querySelector('.notification-title').textContent;
      const status = item.querySelector('.notification-status').textContent;
      
      // Создаем модальное окно с подробной информацией
      showDetailModal(title, status);
    });
  });

  // Функция показа модального окна
  function showDetailModal(title, status) {
    const modal = document.createElement('div');
    modal.className = 'diagnostic-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p><strong>Статус:</strong> ${status}</p>
          <p><strong>Последняя проверка:</strong> ${new Date().toLocaleString('ru-RU')}</p>
          <p><strong>Рекомендации:</strong></p>
          <ul>
            <li>Обратитесь к специалисту для диагностики</li>
            <li>Проверьте состояние компонента</li>
            <li>При необходимости выполните замену</li>
          </ul>
        </div>
        <div class="modal-footer">
          <button class="btn-primary">Записаться на ремонт</button>
          <button class="btn-secondary modal-close">Закрыть</button>
        </div>
      </div>
    `;

    // Стили модального окна
    const modalStyles = document.createElement('style');
    modalStyles.textContent = `
      .diagnostic-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }
      .modal-content {
        background: white;
        border-radius: 20px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #e5e7eb;
      }
      .modal-header h3 {
        margin: 0;
        color: #1f2937;
      }
      .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #6b7280;
      }
      .modal-body {
        padding: 20px;
      }
      .modal-body ul {
        margin-top: 10px;
        padding-left: 20px;
      }
      .modal-footer {
        display: flex;
        gap: 10px;
        padding: 20px;
        border-top: 1px solid #e5e7eb;
      }
      .btn-primary {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        flex: 1;
      }
      .btn-secondary {
        background: #f3f4f6;
        color: #374151;
        padding: 10px 20px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        flex: 1;
      }
    `;

    document.head.appendChild(modalStyles);
    document.body.appendChild(modal);

    // Закрытие модального окна
    const closeButtons = modal.querySelectorAll('.modal-close');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        document.body.removeChild(modal);
        document.head.removeChild(modalStyles);
      });
    });

    // Закрытие по клику вне модального окна
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
        document.head.removeChild(modalStyles);
      }
    });
  }

  // Запуск обновления индикаторов
  updateIndicators();
  setInterval(updateIndicators, 5000); // Обновление каждые 5 секунд
}); 