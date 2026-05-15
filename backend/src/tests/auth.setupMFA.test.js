const request = require("supertest");
const bcrypt = require("bcrypt");

const app = require("../app");
const pool = require("../db/pool");

describe("POST /api/auth/setup-mfa", () => {
  let adminId;

  beforeAll(async () => {
   // await pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");

    const hashedPassword = await bcrypt.hash("123456", 10);

    // manually create admin
    const result = await pool.query(
      `
      INSERT INTO users
      (
        name,
        username,
        email,
        password,
        role,
        is_verified
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING id
      `,
      [
        "Admin User",
        "adminuser",
        `admin_${Date.now()}@gmail.com`,
        hashedPassword,
        "admin",
        true,
      ]
    );

    adminId = result.rows[0].id;
  });

  afterAll(async () => {
    await pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
  });

  it("should setup MFA for admin", async () => {
    const res = await request(app)
      .post("/api/auth/setup-mfa")
      .send({
        userId: adminId,
      });

    expect(res.statusCode).toBe(200);

    expect(res.body.message).toBe(
      "MFA setup successful"
    );

    expect(res.body).toHaveProperty("qr");

    const dbRes = await pool.query(
      `
      SELECT mfa_secret
      FROM users
      WHERE id = $1
      `,
      [adminId]
    );

    expect(dbRes.rows[0].mfa_secret).toBeTruthy();
  });

  it("should reuse existing MFA secret", async () => {
    const res = await request(app)
      .post("/api/auth/setup-mfa")
      .send({
        userId: adminId,
      });

    expect(res.statusCode).toBe(200);

    expect(res.body).toHaveProperty("qr");
  });

  it("should fail for invalid user", async () => {
    const res = await request(app)
      .post("/api/auth/setup-mfa")
      .send({
        userId: 999999,
      });

    expect(res.statusCode).toBe(404);
  });

  it("should fail if userId missing", async () => {
    const res = await request(app)
      .post("/api/auth/setup-mfa")
      .send({});

    expect(res.statusCode).toBe(400);
  });
});