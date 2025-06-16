const { Pool } = require('pg');

const pool = new Pool({
  user: "postgres",
  password: "root",
  host: "localhost",
  port: 5432,
  database: "car"
});

(async () => {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                password VARCHAR(255) NOT NULL,
                imei VARCHAR(50) UNIQUE NOT NULL,
                car_model VARCHAR(50) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'user'
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS car (
                car_id SERIAL PRIMARY KEY,
                model VARCHAR(50) NOT NULL,
                imei VARCHAR(50) NOT NULL
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS user_status (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                car_id INTEGER REFERENCES car(car_id) ON DELETE CASCADE
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS condition_of_the_car (
                id_2 SERIAL PRIMARY KEY,
                car_id INTEGER REFERENCES car(car_id) ON DELETE CASCADE,
                temperature INTEGER,
                Charging_percentage INTEGER,
                Condition_of_the_doors VARCHAR(50)
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS documents (
                documents_id SERIAL PRIMARY KEY,
                car_id INTEGER REFERENCES car(car_id) ON DELETE CASCADE,
                txt VARCHAR(100),
                type VARCHAR(100),
                img VARCHAR(100)
            );
        `);

        

        console.log('Таблицы успешно созданы');
    } catch (err) {
        console.error('Ошибка при создании таблиц', err);
    } finally {
        client.release();
    }
})();