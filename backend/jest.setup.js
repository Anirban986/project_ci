const initDb = require("./src/config/initDb");
const pool = require("./src/db/pool");

beforeAll(async () => {
  await initDb();
});

afterAll(async () => {
  await pool.end();
});