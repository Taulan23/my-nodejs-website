document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.querySelector('#registerForm');
  const loginForm = document.querySelector('#loginForm');
  const toggleImages = document.querySelectorAll('[id^="toggleImage"]');
  const keyImage = document.querySelector('#key');
  const temperatureDisplay = document.querySelector('#temperatureDisplay');
  const decreaseTempButton = document.querySelector('#decreaseTempButton');
  const increaseTempButton = document.querySelector('#increaseTempButton');
  const carModelDisplay = document.querySelector('.mercedes-amg-c-63');
  const registrationLink = document.querySelector('.header-registration');
  const loginLink = document.querySelector('.header-enter');
  const logoutLink = document.createElement('a');
  logoutLink.href = '/api/logout';
  logoutLink.innerHTML = '<div class="header-enter">Выйти</div>';

  logoutLink.addEventListener('click', () => {
    localStorage.clear(); // Очистка localStorage при выходе
  });

  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(registerForm);
      const data = {
        imei: formData.get('imei'),
        carModel: formData.get('carModel'),
        fullName: formData.get('fullName'),
        password: formData.get('password')
      };

      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          const result = await response.json();
          alert('Регистрация прошла успешно!');
          console.log('Пользователь зарегистрирован:', result);
          window.location.href = '/autohtml-project7/index.html'; // Перенаправление на страницу после успешной регистрации
        } else {
          const error = await response.json();
          alert('Ошибка при регистрации: ' + error.message);
        }
      } catch (error) {
        console.error('Ошибка при отправке данных:', error);
        alert('Ошибка при отправке данных');
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(loginForm);
      const data = {
        username: formData.get('username'),
        password: formData.get('password'),
        imei: formData.get('imei'),
        carModel: formData.get('carModel'),
      };

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          const result = await response.json();
          alert('Вход выполнен успешно!');
          console.log('Пользователь вошел:', result);
          localStorage.setItem('userId', result.userId); // Сохранение id пользователя в localStorage
          window.location.href = '/autohtml-project1/index.html'; // Перенаправление на защищенную страницу после успешного входа
        } else {
          const error = await response.json();
          alert('Ошибка при входе: ' + error.message);
        }
      } catch (error) {
        console.error('Ошибка при отправке данных:', error);
        alert('Ошибка при отправке данных');
      }
    });
  }

  if (toggleImages) {
    toggleImages.forEach(image => {
      const imageId = image.getAttribute('id');
      const savedSrc = localStorage.getItem(imageId);
      if (savedSrc) {
        image.setAttribute('src', savedSrc);
      }

      image.addEventListener('click', () => {
        const currentSrc = image.getAttribute('src');
        const newSrc = currentSrc === 'image3.png' ? 'image0.png' : 'image3.png';
        image.setAttribute('src', newSrc);
        localStorage.setItem(imageId, newSrc);
      });
    });
  }

  if (keyImage) {
    const keyImageId = keyImage.getAttribute('id');
    const savedColor = localStorage.getItem(keyImageId);
    if (savedColor) {
      keyImage.style.filter = savedColor;
    } else {
      keyImage.style.filter = 'invert(48%) sepia(92%) saturate(334%) hue-rotate(90deg) brightness(92%) contrast(92%)'; // Зеленый цвет по умолчанию
    }

    keyImage.addEventListener('click', () => {
      const currentColor = keyImage.style.filter;
      const newColor = currentColor === 'invert(48%) sepia(92%) saturate(334%) hue-rotate(90deg) brightness(92%) contrast(92%)'
        ? 'invert(24%) sepia(100%) saturate(7483%) hue-rotate(1deg) brightness(101%) contrast(107%)'
        : 'invert(48%) sepia(92%) saturate(334%) hue-rotate(90deg) brightness(92%) contrast(92%)';
      keyImage.style.filter = newColor;
      localStorage.setItem(keyImageId, newColor);
    });
  }

  if (temperatureDisplay) {
    let currentTemp = localStorage.getItem('currentTemp') || 21;
    temperatureDisplay.textContent = `${currentTemp} °C`;

    if (decreaseTempButton) {
      decreaseTempButton.addEventListener('click', () => {
        currentTemp--;
        temperatureDisplay.textContent = `${currentTemp} °C`;
        localStorage.setItem('currentTemp', currentTemp);
      });
    }

    if (increaseTempButton) {
      increaseTempButton.addEventListener('click', () => {
        currentTemp++;
        temperatureDisplay.textContent = `${currentTemp} °C`;
        localStorage.setItem('currentTemp', currentTemp);
      });
    }
  }

  if (carModelDisplay) {
    fetch('/api/user')
      .then(response => response.json())
      .then(data => {
        carModelDisplay.textContent = data.carModel;
      })
      .catch(error => {
        console.error('Ошибка при получении модели автомобиля:', error);
      });
  }

  const userId = localStorage.getItem('userId');
  if (userId) {
    registrationLink.style.display = 'none';
    loginLink.style.display = 'none';
    document.querySelector('.right-header').appendChild(logoutLink);
    
    // Загружаем данные пользователя
    const userInfo = document.querySelector('#userInfo');
    if (userInfo) {
      fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${userId}`
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Не удалось получить данные пользователя');
      })
      .then(data => {
        userInfo.textContent = data.fullName || 'Пользователь';
      })
      .catch(error => {
        console.error('Ошибка при получении данных пользователя:', error);
        userInfo.textContent = 'Пользователь';
      });
    }
  }

  // Функционал сигнализации
  const alarmIcon = document.querySelector('#alarmIcon');
  if (alarmIcon) {
    const savedAlarmState = localStorage.getItem('alarmState') || 'off';
    alarmIcon.textContent = savedAlarmState === 'on' ? '🔊' : '🔇';
    if (savedAlarmState === 'on') {
      alarmIcon.classList.add('active');
    }

    alarmIcon.addEventListener('click', () => {
      const currentState = alarmIcon.textContent;
      const newState = currentState === '🔇' ? 'on' : 'off';
      
      alarmIcon.textContent = newState === 'on' ? '🔊' : '🔇';
      
      if (newState === 'on') {
        alarmIcon.classList.add('active');
        alarmIcon.style.backgroundColor = 'rgba(220, 38, 38, 0.2)';
        alarmIcon.style.color = '#dc2626';
      } else {
        alarmIcon.classList.remove('active');
        alarmIcon.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        alarmIcon.style.color = '#374151';
      }
      
      localStorage.setItem('alarmState', newState);
    });
  }
});