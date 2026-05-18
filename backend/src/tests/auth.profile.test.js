const request = require("supertest");
const app = require("../app");
const pool = require("../db/pool");

describe("GET /api/auth/profile (JWT cookie auth)", () => {
  let agent;
  let email;

  beforeEach(async () => {
    await pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");

    agent = request.agent(app);
    email = `profile_${Date.now()}@gmail.com`;

    // 1. Register user
    await agent
      .post("/api/auth/register")
      .send({
        name: "Profile User",
        username: "profileuser",
        email,
        phone_number: "1234567890",
        role: "doctor",
        password: "123456",
      });

    // 2. Verify user (required for login)
    await pool.query(
      "UPDATE users SET is_verified = true WHERE email = $1",
      [email]
    );

    // 3. Login → sets cookie in agent
    const loginRes = await agent.post("/api/auth/login").send({
      email,
      password: "123456",
    });

    expect(loginRes.statusCode).toBe(200);
  });

  afterAll(async () => {
    //await pool.end();
  });

  it("should return user profile when JWT cookie is valid", async () => {
    const res = await agent.get("/api/auth/profile");

    expect(res.statusCode).toBe(200);

    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(email);
  });

  it("should reject access without cookie", async () => {
    const res = await request(app).get("/api/auth/profile");

    expect(res.statusCode).toBe(401);
  });
});