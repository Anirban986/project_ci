const request = require("supertest");
const app = require("../app");
const pool = require("../db/pool");

describe("POST /api/auth/login", () => {
  let email;

  beforeEach(async () => {
   // await pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");

    email = `login_${Date.now()}@gmail.com`;

    // 1. Register user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Login User",
        username: "loginuser",
        email,
        phone_number: "1234567890",
        role: "doctor",
        password: "123456",
      });

    // 2. Verify user directly in DB (important for login tests)
    await pool.query(
      `UPDATE users SET is_verified = true WHERE email = $1`,
      [email]
    );
  });

  afterAll(async () => {
   // await pool.end();
  });

  it("should login verified user successfully", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password: "123456",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.user).toHaveProperty("email", email);
  });

  it("should fail for wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password: "wrongpassword",
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("should fail if user is not verified", async () => {
    const unverifiedEmail = `unverified_${Date.now()}@gmail.com`;

    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Unverified",
        username: "unverified",
        email: unverifiedEmail,
        phone_number: "1234567890",
        role: "doctor",
        password: "123456",
      });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: unverifiedEmail,
        password: "123456",
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Please verify your email first");
  });
});