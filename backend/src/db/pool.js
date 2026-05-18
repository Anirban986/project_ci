const { Pool } = require("pg");

require("dotenv").config({
  path:
    process.env.NODE_ENV === "test"
      ? ".env.test"
      : ".env",
});

const isProduction =
  process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  ssl: isProduction
    ? {
        rejectUnauthorized: false,
      }
    : false,
});

module.exports = pool;