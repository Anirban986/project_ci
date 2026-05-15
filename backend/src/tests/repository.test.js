const pool = require("../db/pool");

beforeEach(async () => {
  await pool.query("DELETE FROM users");
});

afterAll(async () => {

 // await pool.end();

});

describe("Users Table", () => {

  it("should insert user into database", async () => {

    const result = await pool.query(
      `
      INSERT INTO users(name,username, email, password)
      VALUES($1, $2, $3, $4)
      RETURNING *
      `,
      [
        "Anirban",
        "anirban",
        "anirban@gmail.com",
        "123456"
      ]
    );

    expect(result.rows[0].email)
      .toBe("anirban@gmail.com");

  });

});