const request = require("supertest");
const app = require("../app");
const pool = require("../db/pool");

describe("POST /api/auth/forgot-password", () => {
  const email = `forgot_${Date.now()}@gmail.com`;

  beforeAll(async () => {
   // await pool.query("DELETE FROM users");

    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        username: "testuser",
        email,
        phone_number: "1234567890",
        role: "doctor",
        password: "123456"
      });

    await pool.query(
      "UPDATE users SET is_verified = true WHERE email = $1",
      [email]
    );
  });

  afterAll(async () => {
    //await pool.end();
  });

  it("should send OTP if user exists", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("OTP sent to email");

    const dbRes = await pool.query(
      "SELECT reset_password_otp, reset_password_otp_expires FROM users WHERE email=$1",
      [email]
    );

    expect(dbRes.rows.length).toBe(1);

    // IMPORTANT: OTP is hashed → just check existence
    expect(dbRes.rows[0].reset_password_otp).toBeTruthy();
    expect(dbRes.rows[0].reset_password_otp_expires).toBeTruthy();
  });

  it("should still return success message for non-existing email", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "fake123@gmail.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("If email exists, OTP sent");
  });
});