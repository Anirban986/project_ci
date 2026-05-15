const request = require("supertest");
const app = require("../app");
const pool = require("../db/pool");

describe("POST /api/auth/logout (JWT cookie)", () => {
  let agent;
  let email;

  beforeEach(async () => {
  //  await pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");

    agent = request.agent(app);
    email = `logout_${Date.now()}@gmail.com`;

    // 1. Register user
    await agent
      .post("/api/auth/register")
      .send({
        name: "Logout User",
        username: "logoutuser",
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

    // 3. Login (sets JWT cookie in agent)
    const loginRes = await agent.post("/api/auth/login").send({
      email,
      password: "123456",
    });

    expect(loginRes.statusCode).toBe(200);
  });

  afterAll(async () => {
   // await pool.end();
  });

  it("should logout user and clear cookie", async () => {
    const res = await agent.post("/api/auth/logout");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User logged out successfully");
  });

  it("should block access after logout", async () => {
    // logout first
    await agent.post("/api/auth/logout");

    // try accessing protected route
    const res = await agent.get("/api/auth/profile");

    expect(res.statusCode).toBe(401);
  });
});