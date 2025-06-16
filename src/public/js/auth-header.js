document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId');
  const registrationLink = document.querySelector('.header-registration');
  const loginLink = document.querySelector('.header-enter');
  const userInfo = document.querySelector('#userInfo');
  
  if (userId) {
    // Скрываем ссылки на регистрацию и вход
    if (registrationLink) {
      registrationLink.style.display = 'none';
    }
    if (loginLink) {
      loginLink.style.display = 'none';
    }
    
    // Создаем кнопку выхода
    const logoutLink = document.createElement('a');
    logoutLink.href = '#';
    logoutLink.innerHTML = '<div class="header-enter">Выйти</div>';
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = '/autohtml-project7/index.html';
    });
    
    // Добавляем кнопку выхода в заголовок
    const rightHeader = document.querySelector('.right-header');
    if (rightHeader) {
      rightHeader.appendChild(logoutLink);
    }
    
    // Загружаем данные пользователя
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
      if (userInfo) {
        userInfo.textContent = data.fullName || 'Пользователь';
      }
    })
    .catch(error => {
      console.error('Ошибка при получении данных пользователя:', error);
      if (userInfo) {
        userInfo.textContent = 'Пользователь';
      }
    });
  }
}); 