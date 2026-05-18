const request = require("supertest");
const speakeasy = require("speakeasy");

const app = require("../app");
const pool = require("../db/pool");

jest.setTimeout(30000);

describe("POST /api/auth/verify-mfa", () => {
  let adminId;
  let adminSecret;

  beforeAll(async () => {
   // await pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");

    // ✅ Create admin directly in DB
    const result = await pool.query(
      `
      INSERT INTO users
      (
        name,
        username,
        email,
        password,
        role,
        is_verified,
        mfa_enabled,
        mfa_secret
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id, mfa_secret
      `,
      [
        "Admin User",
        "adminuser",
        `admin_${Date.now()}@gmail.com`,
        "hashedpassword",
        "admin",
        true,
        true,
        speakeasy.generateSecret({ length: 20 }).base32,
      ]
    );

    adminId = result.rows[0].id;
    adminSecret = result.rows[0].mfa_secret;
  });

  afterAll(async () => {
    await pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
   // await pool.end();
  });

  it("should verify MFA successfully with valid OTP", async () => {
    // Generate valid OTP
    const otp = speakeasy.totp({
      secret: adminSecret,
      encoding: "base32",
    });

    const res = await request(app)
      .post("/api/auth/verify-mfa")
      .send({
        userId: adminId,
        otp,
      });

    expect(res.statusCode).toBe(200);

    expect(res.body).toHaveProperty(
      "message",
      "Admin verified successfully"
    );

    expect(res.body).toHaveProperty("user");

    // ✅ cookie check
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should fail with invalid OTP", async () => {
    const res = await request(app)
      .post("/api/auth/verify-mfa")
      .send({
        userId: adminId,
        otp: "000000",
      });

    expect(res.statusCode).toBe(401);

    expect(res.body).toHaveProperty(
      "message",
      "Invalid OTP code. Please try again."
    );
  });

  it("should fail if MFA is not setup", async () => {
    // Create another admin without MFA
    const result = await pool.query(
      `
      INSERT INTO users
      (
        name,
        username,
        email,
        password,
        role,
        is_verified,
        mfa_enabled,
        mfa_secret
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id
      `,
      [
        "No MFA Admin",
        "nomfaadmin",
        `nomfa_${Date.now()}@gmail.com`,
        "hashedpassword",
        "admin",
        true,
        false,
        null,
      ]
    );

    const noMfaUserId = result.rows[0].id;

    const res = await request(app)
      .post("/api/auth/verify-mfa")
      .send({
        userId: noMfaUserId,
        otp: "123456",
      });

    expect(res.statusCode).toBe(400);

    expect(res.body).toHaveProperty(
      "message",
      "MFA is not set up for this user"
    );
  });

  it("should fail for invalid user", async () => {
    const res = await request(app)
      .post("/api/auth/verify-mfa")
      .send({
        userId: 999999,
        otp: "123456",
      });

    expect(res.statusCode).toBe(404);

    expect(res.body).toHaveProperty(
      "message",
      "User not found"
    );
  });

  it("should fail if userId or otp missing", async () => {
    const res = await request(app)
      .post("/api/auth/verify-mfa")
      .send({
        userId: adminId,
      });

    expect(res.statusCode).toBe(400);

    expect(res.body).toHaveProperty(
      "message",
      "User ID and OTP are required"
    );
  });
});