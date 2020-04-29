module.exports = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: process.env.DB_POOL_MAX,
  idleTimeoutMillis: process.env.DB_POOL_IDLE_TIMEOUT,
  connectionTimeoutMillis: process.env.DB_POOL_CONNECTION_TIMEOUT
};