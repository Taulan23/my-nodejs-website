const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  user: "postgres",
  password: "root",
  host: "localhost",
  port: 5432,
  database: "car"
});

pool.connect(err => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.stack);
  } else {
    console.log('Подключение успешно!');
  }
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.get('/', (req, res) => {
  return res.redirect('autohtml-project7/index.html');
});

app.post('/api/register', async (req, res) => {
  const { imei, carModel, fullName, password } = req.body;

  try {
    // Проверяем, существует ли пользователь с таким IMEI
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE imei = $1',
      [imei]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Пользователь с таким IMEI уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (imei, car_model, full_name, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [imei, carModel, fullName, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при регистрации пользователя:', error);
    res.status(500).json({ message: 'Ошибка при регистрации пользователя' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password, imei, carModel} = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE full_name = $1 AND imei = $2 AND car_model = $3',
      [username, imei, carModel]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        req.session.userId = user.id;
        req.session.role = user.role;
        req.session.carModel = user.car_model; // Сохранение модели автомобиля в сессии
        res.status(200).json({ message: 'Вход выполнен успешно', userId: user.id, role: user.role, carModel: user.car_model });
      } else {
        res.status(401).json({ message: 'Неверный логин или пароль' });
      }
    } else {
      res.status(401).json({ message: 'Неверный логин или пароль' });
    }
  } catch (error) {
    console.error('Ошибка при авторизации пользователя:', error);
    res.status(500).json({ message: 'Ошибка при авторизации пользователя' });
  }
});

app.get('/api/user', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Пользователь не авторизован' });
  }
  res.json({ carModel: req.session.carModel });
});

app.get('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка при выходе из системы' });
    }
    res.redirect('/autohtml-project7/index.html');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});