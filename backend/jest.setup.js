// Mock nodemailer globally for all tests
jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue(true),
  })),
}));


const initDb = require("./src/config/initDb");
const pool = require("./src/db/pool");

beforeAll(async () => {
  await initDb();
});

afterAll(async () => {
  await pool.end();
});