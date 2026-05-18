const pool = require("../db/pool");

async function findByEmailAndUsername(username, email) {
  const query = `
    SELECT *
    FROM users
    WHERE username = $1
       OR email = $2
    LIMIT 1;
  `;

  const values = [username, email];

  const result = await pool.query(query, values);

  return result.rows[0];
}

async function createUser(userData) {
  const {
    name,
    username,
    email,
    password,
    role,
    plan,
    phone_number,
    verification_code,
    verification_code_expires,
    mfa_enabled,
    mfa_secret
  } = userData;

  const query = `
    INSERT INTO users (
      name,
      username,
      email,
      password,
      role,
      plan,
      phone_number,
      verification_code,
      verification_code_expires,
      mfa_enabled,
      mfa_secret
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *;
  `;

  const values = [
    name,
    username,
    email,
    password,
    role,
    plan,
    phone_number,
    verification_code,
    verification_code_expires,
    mfa_enabled,
    mfa_secret
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
}

async function findUserById(id) {
  console.log("🔍 Repository: Finding user by ID:", id);

  try {
    const query = `
      SELECT *
      FROM users
      WHERE id = $1
      LIMIT 1;
    `;

    const result = await pool.query(query, [id]);

    console.log("✅ Repository: User found:", !!result.rows[0]);

    return result.rows[0];
  } catch (error) {
    console.error("❌ Repository error:", error);
    throw error;
  }
}

async function findByVerificationCode(code) {
  const query = `
    SELECT *
    FROM users
    WHERE verification_code = $1
    LIMIT 1;
  `;

  const result = await pool.query(query, [code]);

  return result.rows[0];
}

async function updateUser(id, updatedData) {
  const {
    is_verified,
    verification_code,
    verification_code_expires,
    reset_password_token,
    reset_password_expires,
    mfa_enabled,
    mfa_secret
  } = updatedData;

  const query = `
    UPDATE users
    SET
      is_verified = $1,
      verification_code = $2,
      verification_code_expires = $3,
      reset_password_token = $4,
      reset_password_expires = $5,
      mfa_enabled = $6,
      mfa_secret = $7,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $8
    RETURNING *;
  `;

  const values = [
    is_verified,
    verification_code,
    verification_code_expires,
    reset_password_token,
    reset_password_expires,
    mfa_enabled,
    mfa_secret,
    id,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
}


async function setForgotPasswordOTP(
  id,
  hashedOtp,
  expiryDate
) {

  const query = `
    UPDATE users
    SET
      reset_password_otp = $1,
      reset_password_otp_expires = $2,
      reset_password_attempts = 0,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *;
  `;

  const values = [
    hashedOtp,
    expiryDate,
    id,
  ];

  const result =
    await pool.query(query, values);

  return result.rows[0];
}

async function updateResetPassword(
  id,
  hashedPassword
) {

  const query = `
    UPDATE users
    SET
      password = $1,
      reset_password_otp = NULL,
      reset_password_otp_expires = NULL,
      reset_password_attempts = 0,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *;
  `;

  const values = [
    hashedPassword,
    id,
  ];

  const result =
    await pool.query(query, values);

  return result.rows[0];
}

module.exports = {
  findByEmailAndUsername,
  createUser,
  findUserById,
  findByVerificationCode,
  updateUser,
  setForgotPasswordOTP,
  updateResetPassword
};