const pool = require("../db/pool");

describe("Database Connection", () => {

  it("should connect to PostgreSQL", async () => {

    const result = await pool.query("SELECT 1");

    expect(result).toBeDefined();

  });

});