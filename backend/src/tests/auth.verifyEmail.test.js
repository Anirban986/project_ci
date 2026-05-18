const request = require("supertest");
const app = require("../app");
const pool = require("../db/pool");

describe("POST /api/auth/verify-code", () => {
  let email;
  let otp;
  let userId;

  beforeEach(async () => {
    await pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");

    email = `verify_${Date.now()}@gmail.com`;

    // register user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        username: "testuser",
        email,
        phone_number: "1234567890",
        role: "doctor",
        password: "123456",
      });

    // fetch OTP from DB (IMPORTANT FIX)
    const dbRes = await pool.query(
      "SELECT id, verification_code FROM users WHERE email = $1",
      [email]
    );

    userId = dbRes.rows[0].id;
    otp = dbRes.rows[0].verification_code;
  });

  afterAll(async () => {
    //await pool.end();
  });

  it("should verify user with correct OTP", async () => {
    const verifyRes = await request(app)
      .post("/api/auth/verify-code")
      .send({
        email,
        code: String(otp), // IMPORTANT FIX (type match)
      });

    expect(verifyRes.statusCode).toBe(200);
    expect(verifyRes.body).toHaveProperty("message");

    // verify DB update
    const user = await pool.query(
      "SELECT is_verified, verification_code FROM users WHERE id = $1",
      [userId]
    );

    expect(user.rows[0].is_verified).toBe(true);
    expect(user.rows[0].verification_code).toBeNull();
  });

  it("should fail if email does not exist", async () => {
    const res = await request(app)
      .post("/api/auth/verify-code")
      .send({
        email: "fake@email.com",
        code: "123456",
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

  it("should fail for invalid OTP", async () => {
    const res = await request(app)
      .post("/api/auth/verify-code")
      .send({
        email,
        code: "000000",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid verification code");
  });
});