const pool = require("../db/pool");

describe("PostgreSQL Database Connection", () => {
  test("should connect successfully", async () => {
    const result = await pool.query("SELECT NOW()");

    expect(result.rows).toBeDefined();
    expect(result.rows.length).toBeGreaterThan(0);
  });
});

afterAll(async () => {
  await pool.end();
});