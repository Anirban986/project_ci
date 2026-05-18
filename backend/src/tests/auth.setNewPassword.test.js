const request = require("supertest");
const app = require("../app");
const pool = require("../db/pool");
const bcrypt = require("bcrypt");

describe("POST /api/auth/set-new-password", () => {
  let email;

  beforeEach(async () => {
    await pool.query(
      "TRUNCATE TABLE users RESTART IDENTITY CASCADE"
    );

    email = `reset_${Date.now()}@gmail.com`;

    // Register test user
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Reset User",
        username: "resetuser",
        email,
        phone_number: "1234567890",
        role: "doctor",
        password: "oldpassword123",
      });

    expect(registerRes.statusCode).toBe(201);

    // Verify user manually
    await pool.query(
      "UPDATE users SET is_verified = true WHERE email = $1",
      [email]
    );
  });

  afterAll(async () => {
    // keep empty
  });

  it("should set new password successfully", async () => {
    const res = await request(app)
      .post("/api/auth/set-new-password")
      .send({
        email,
        newPassword: "newpassword123",
      });

    expect(res.statusCode).toBe(200);

    expect(res.body).toHaveProperty(
      "message",
      "Password reset successful"
    );

    // Verify password updated in DB
    const dbRes = await pool.query(
      "SELECT password FROM users WHERE email = $1",
      [email]
    );

    const isMatch = await bcrypt.compare(
      "newpassword123",
      dbRes.rows[0].password
    );

    expect(isMatch).toBe(true);
  });

  it("should fail if user does not exist", async () => {
    const res = await request(app)
      .post("/api/auth/set-new-password")
      .send({
        email: "unknown@gmail.com",
        newPassword: "newpassword123",
      });

    expect(res.statusCode).toBe(400);

    expect(res.body).toHaveProperty(
      "message",
      "Invalid request"
    );
  });

  it("should overwrite old password", async () => {
    await request(app)
      .post("/api/auth/set-new-password")
      .send({
        email,
        newPassword: "updatedpass456",
      });

    const dbRes = await pool.query(
      "SELECT password FROM users WHERE email = $1",
      [email]
    );

    const oldPasswordMatch = await bcrypt.compare(
      "oldpassword123",
      dbRes.rows[0].password
    );

    const newPasswordMatch = await bcrypt.compare(
      "updatedpass456",
      dbRes.rows[0].password
    );

    expect(oldPasswordMatch).toBe(false);
    expect(newPasswordMatch).toBe(true);
  });
});