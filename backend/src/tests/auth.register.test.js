const request = require("supertest");
const app = require("../app");
const pool = require("../db/pool");

// 🔥 IMPORTANT: isolate DB per test
beforeEach(async () => {
 // await pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
});

// ❌ DO NOT call pool.end here (moves to global teardown)
afterAll(async () => {
  // intentionally empty
});

describe("POST /api/auth/register", () => {
  
  it("should register a new user successfully", async () => {
    const email = `test_${Date.now()}@gmail.com`;

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Anirban",
        username: "anirban",
        email,
        phone_number: "1234567890",
        role: "doctor",
        password: "123456",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message");

    // verify DB insert
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].email).toBe(email);
  });

  it("should fail if email already exists", async () => {
    const email = `duplicate_${Date.now()}@gmail.com`;

    // first insert
    await request(app).post("/api/auth/register").send({
      name: "User1",
      username: "user1",
      email,
      phone_number: "1234567890",
      role: "doctor",
      password: "123456",
    });

    // duplicate insert
    const res = await request(app).post("/api/auth/register").send({
      name: "User2",
      username: "user2",
      email,
      phone_number: "1234567890",
      role: "doctor",
      password: "123456",
    });

    expect(res.statusCode).toBe(409);
  });

  it("should store user as NOT verified by default", async () => {
    const email = `verify_${Date.now()}@gmail.com`;

    await request(app).post("/api/auth/register").send({
      name: "Test",
      username: "testuser",
      email,
      phone_number: "1234567890",
      role: "doctor",
      password: "123456",
    });

    const result = await pool.query(
      "SELECT is_verified FROM users WHERE email = $1",
      [email]
    );

    expect(result.rows[0].is_verified).toBe(false);
  });
});