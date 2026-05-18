const request = require("supertest");
const app = require("../app");
const pool = require("../db/pool");
const bcrypt = require("bcrypt");

describe("POST /api/auth/verify-reset-otp", () => {
  const email = `reset_${Date.now()}@gmail.com`;
  let plainOtp;

  beforeAll(async () => {
    await pool.query(
      "TRUNCATE TABLE users RESTART IDENTITY CASCADE"
    );

    // Register user
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

    // Verify user manually
    await pool.query(
      "UPDATE users SET is_verified = true WHERE email = $1",
      [email]
    );

    // Create OTP manually
    plainOtp = "123456";

    const hashedOtp = await bcrypt.hash(
      plainOtp,
      10
    );

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
    // keep empty
  });

  it("should verify OTP successfully", async () => {
    const res = await request(app)
      .post("/api/auth/verify-reset-otp")
      .send({
        email,
        otp: plainOtp,
      });

    expect(res.statusCode).toBe(200);

    expect(res.body).toHaveProperty(
      "message",
      "OTP verified successfully"
    );
  });

  it("should fail with invalid OTP", async () => {
    const res = await request(app)
      .post("/api/auth/verify-reset-otp")
      .send({
        email,
        otp: "000000",
      });

    expect(res.statusCode).toBe(400);

    expect(res.body).toHaveProperty(
      "message",
      "Invalid OTP"
    );
  });

  it("should fail for unknown user", async () => {
    const res = await request(app)
      .post("/api/auth/verify-reset-otp")
      .send({
        email: "unknown@gmail.com",
        otp: "123456",
      });

    expect(res.statusCode).toBe(400);

    expect(res.body).toHaveProperty(
      "message",
      "Invalid request"
    );
  });

  it("should fail for expired OTP", async () => {
    const expiredOtp = await bcrypt.hash(
      "654321",
      10
    );

    await pool.query(
      `
      UPDATE users
      SET reset_password_otp = $1,
          reset_password_otp_expires = NOW() - INTERVAL '1 minute'
      WHERE email = $2
      `,
      [expiredOtp, email]
    );

    const res = await request(app)
      .post("/api/auth/verify-reset-otp")
      .send({
        email,
        otp: "654321",
      });

    expect(res.statusCode).toBe(400);

    expect(res.body).toHaveProperty(
      "message",
      "OTP expired"
    );
  });

  it("should fail after too many attempts", async () => {
    const hashedOtp = await bcrypt.hash(
      "999999",
      10
    );

    await pool.query(
      `
      UPDATE users
      SET reset_password_otp = $1,
          reset_password_attempts = 5,
          reset_password_otp_expires = NOW() + INTERVAL '10 minutes'
      WHERE email = $2
      `,
      [hashedOtp, email]
    );

    const res = await request(app)
      .post("/api/auth/verify-reset-otp")
      .send({
        email,
        otp: "999999",
      });

    expect(res.statusCode).toBe(400);

    expect(res.body).toHaveProperty(
      "message",
      "Too many attempts. Try again later."
    );
  });
});