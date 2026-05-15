const request = require("supertest");
const app = require("../app");
const pool = require("../db/pool");
const bcrypt = require("bcrypt");

describe("POST /api/auth/reset-password", () => {
  const email = `reset_${Date.now()}@gmail.com`;
  let plainOtp;

  beforeAll(async () => {
    // ⚠️ safer cleanup than DELETE
    //await pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");

    // 1. Register user
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Reset User",
        username: "resetuser",
        email,
        phone_number: "1234567890",
        role: "doctor",
        password: "123456",
      });

    expect(registerRes.statusCode).toBe(201);

    // 2. Verify email manually
    await pool.query(
      "UPDATE users SET is_verified = true WHERE email = $1",
      [email]
    );

    // 3. Create forgot password OTP (same logic as service)
    plainOtp = "123456";

    const hashedOtp = await bcrypt.hash(plainOtp, 10);

    await pool.query(
      `
      UPDATE users
      SET reset_password_otp = $1,
          reset_password_otp_expires = NOW() + INTERVAL '10 minutes',
          reset_password_attempts = 0
      WHERE email = $2
      `,
      [hashedOtp, email]
    );
  });

  afterAll(async () => {
    // IMPORTANT: do NOT call pool.end here if other tests exist
    // await pool.end(); ❌ remove this
  });

  it("should reset password successfully with valid OTP", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({
        email,
        otp: plainOtp,
        newPassword: "newpass123",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");

    // verify password changed
    const db = await pool.query(
      "SELECT password FROM users WHERE email = $1",
      [email]
    );

    const isMatch = await bcrypt.compare("newpass123", db.rows[0].password);
    expect(isMatch).toBe(true);
  });

  it("should fail with invalid OTP", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({
        email,
        otp: "wrongotp",
        newPassword: "newpass123",
      });

    expect(res.statusCode).toBe(400);
  });

  it("should fail for unknown user", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({
        email: "unknown@gmail.com",
        otp: "123456",
        newPassword: "newpass123",
      });

    expect(res.statusCode).toBe(400);
  });
});