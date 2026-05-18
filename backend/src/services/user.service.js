const userRepository = require("../repositories/user.repository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const QRCode = require("qrcode");
const speakeasy = require("speakeasy");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { generateforgotPasswordOTP } = require("../utils/otp");
const { sendForgotPasswordOTP } = require("../utils/mailer");

dotenv.config();


// ================= HELPER =================
const brevo = require("@getbrevo/brevo");

const apiInstance = new brevo.default.TransactionalEmailsApi();
apiInstance.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

async function sendOTPEmail(email, code) {
  const sendSmtpEmail = new brevo.default.SendSmtpEmail();
  sendSmtpEmail.sender = { email: "your-brevo-email@gmail.com", name: "MedLink" };
  sendSmtpEmail.to = [{ email }];
  sendSmtpEmail.subject = "Verify your email";
  sendSmtpEmail.htmlContent = `
    <div style="font-family:sans-serif;text-align:center;">
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1 style="letter-spacing:5px;color:#4CAF50;">${code}</h1>
      <p>This code will expire in 10 minutes.</p>
    </div>
  `;

  await apiInstance.sendTransacEmail(sendSmtpEmail);
}
//register service

async function registerUserService(userData) {
  const { name, phone_number, role, username, email, password } = userData;

  if (!name || !role || !phone_number || !username || !email || !password) {
    throw new Error("All_fields_are_required");
  }

  const existingUser = await userRepository.findByEmailAndUsername(
    username,
    email,
  );
  if (existingUser) {
    throw new Error("Username_or_email_already_exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOTP();
  console.log("Generated OTP for registration:", otp);
  const newUser = await userRepository.createUser({
    name,
    role,
    phone_number,
    username,
    email,
    password: hashedPassword,
    isVerified: false,
    verification_code: otp,
    verification_code_expires: new Date(Date.now() + 10 * 60 * 1000),
  });

  try {
    await sendOTPEmail(email, otp);
    console.log("✅ Verification email sent to:", email);
    console.log("otp:", otp);
  } catch (err) {
    console.error("Email error:", err);
    throw new Error("Email_send_failed");
  }

  return { newUser };
}

// ================= VERIFY OTP =================
async function verifyCodeService(email, code) {
  const user = await userRepository.findByEmailAndUsername(null, email);
  console.log("user details in service:", user);
  if (!user) throw new Error("User_not_found");

  if (user.is_verified) throw new Error("Already_verified");

  if (!user.verification_code || user.verification_code !== code) {
    console.log("user.verification_code:", user.verification_code);
    console.log("Provided code:", code);
    throw new Error("Invalid_code");
  }

  if (user.verification_code_expires < new Date()) {
    throw new Error("Code_expired");
  }

  await userRepository.updateUser(user.id, {
    is_verified: true,
    verification_code: null,
    verification_code_expires: null,
  });

  return true;
}

// ================= RESEND OTP =================
async function resendVerificationService(email) {
  const user = await userRepository.findByEmailAndUsername(null, email);

  if (!user) throw new Error("User_not_found");
  if (user.is_verified) throw new Error("Already_verified");

  const otp = generateOTP();

  await userRepository.updateUser(user.id, {
    verification_code: otp,
    verification_code_expires: new Date(Date.now() + 10 * 60 * 1000),
  });

  try {
    await sendOTPEmail(email, otp);
  } catch (err) {
    console.error("Email resend error:", err);
    throw new Error("Email_send_failed");
  }
}

//==========LOGIN===========
async function loginUserService(userData) {
  const { email, password } = userData;

  const user = await userRepository.findByEmailAndUsername(null, email);
  if (!user) {
    throw new Error("Invalid_email_or_password");
  }

  if (!user.is_verified) {
    throw new Error("Email_not_verified");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid_email_or_password");
  }

  // 🔐 Admin + MFA enabled → require MFA verification
  if (user.role === "admin" && user.mfa_enabled) {
    return {
      status: "MFA_REQUIRED",
      userId: user.id,
    };
  }

  // 🔐 First-time admin → setup MFA
  if (user.role === "admin" && !user.mfa_enabled) {
    return {
      status: "SETUP_MFA",
      userId: user.id,
    };
  }
  // ✅ Normal login (non-admin or admin without MFA requirement)
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
  );

  return {
    status: "SUCCESS",
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      plan: user.plan,
    },
    token,
  };
}

//=================== FORGOT PASSWORD =================
async function forgotPassword(email) {
  const user = await userRepository.findByEmailAndUsername(null, email);

  if (!user) {
    return { message: "If email exists, OTP sent" };
  }

  const otp = generateforgotPasswordOTP();

  await userRepository.setForgotPasswordOTP(
  user.id,
  await bcrypt.hash(otp, 10),
  new Date(Date.now() + 10 * 60 * 1000)
);

  await sendForgotPasswordOTP(email, otp);

  return { message: "OTP sent to email" };
}

// ================= VERIFY  OTP =================
async function verifyResetOtp(email, otp) {
  const user =
    await userRepository.findByEmailAndUsername(
      null,
      email
    );

  if (!user) {
    throw new Error("Invalid request");
  }

  if (
    new Date(user.reset_password_otp_expires) <
    new Date()
  ) {
    throw new Error("OTP expired");
  }

  if (user.reset_password_attempts >= 5) {
    throw new Error(
      "Too many attempts. Try again later."
    );
  }

  const isMatch = await bcrypt.compare(
    otp,
    user.reset_password_otp
  );

  if (!isMatch) {
    await userRepository.updateUser(user.id, {
      reset_password_attempts:
        user.reset_password_attempts + 1,
    });

    throw new Error("Invalid OTP");
  }

  return {
    message: "OTP verified successfully",
  };
}


// ================= SET NEW PASSWORD =================
async function setNewPassword(email, newPassword) {
  const user =
    await userRepository.findByEmailAndUsername(
      null,
      email
    );

  if (!user) {
    throw new Error("Invalid request");
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    10
  );

  await userRepository.updateResetPassword(
    user.id,
    hashedPassword
  );

  return {
    message: "Password reset successful",
  };
}

//=================== USER PROFILE =================
async function userProfileService(userId) {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new Error("User_not_found");
  }
  return {
    id: user.id,
    name: user.name,
    phone_number: user.phone_number,
    username: user.username,
    email: user.email,
    role: user.role,
    plan: user.plan,
    //planActivatedAt: user.planActivatedAt,
    //planExpiresAt: user.planExpiresAt,
  };
}

//=================== UPGRADE PLAN =================
/*async function upgradePlanService(userId) {
  const user = await userRepository.findUserById(userId);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (user.plan === "premium") {
    console.log("⚠️ Already premium");
    throw new Error("ALREADY_PREMIUM");
  }

  user.plan = "premium";
  user.planActivatedAt = new Date();

  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);
  user.planExpiresAt = expiry;
  const savedUser = await userRepository.updateUser(user);

  console.log("✅ USER AFTER SAVE:", savedUser);

  return {
    plan: user.plan,
    activatedAt: user.planActivatedAt,
    expiresAt: user.planExpiresAt,
  };
}
  */

//=================== GET CURRENT USER =================
async function getCurrentUser(userId) {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    plan: user.plan,
    planActivatedAt: user.planActivatedAt,
    planExpiresAt: user.planExpiresAt,
  };
}

// 🔥🔥🔥 For admin only 🔥🔥🔥
//=================== SETUP MFA =================
async function setupMfaService(userId) {
  const user = await userRepository.findUserById(userId);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (user.role !== "admin") {
    throw new Error("ADMIN_ONLY");
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔧 MFA SETUP");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📧 User:", user.email);

  // ✅ STEP 1: If already exists → reuse
  if (user.mfa_secret) {
    console.log("⚠️ MFA already exists. Reusing secret:", user.mfa_secret);

    const otpauth = `otpauth://totp/medLink:${user.email}?secret=${user.mfa_secret}&issuer=medLink`;
    const qr = await QRCode.toDataURL(otpauth);

    return {
      qr,
      secret: user.mfa_secret,
      manualEntry: user.mfa_secret,
    };
  }

  // ✅ STEP 2: Generate NEW secret only once
  const secret = speakeasy.generateSecret({
    name: `medLink (${user.email})`,
    length: 32,
  });

  console.log("🔑 New Secret:", secret.base32);

  const testToken = speakeasy.totp({
    secret: secret.base32,
    encoding: "base32",
  });

  console.log("🎯 Test token:", testToken);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // ✅ Save
  await userRepository.updateUser(userId, {
    mfa_secret: secret.base32,
    mfa_enabled: false,
  });

  // ✅ STEP 3: ALWAYS return
  const otpauth = `otpauth://totp/medLink:${user.email}?secret=${secret.base32}&issuer=medLink`;
  const qr = await QRCode.toDataURL(otpauth);

  return {
    qr,
    secret: secret.base32,
    manualEntry: secret.base32,
    mfaEnabled: false,
  };
}

//=================== VERIFY MFA =================
async function verifyMfaService(userId, otp) {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔍 MFA VERIFICATION STARTED");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📥 User ID:", userId);
  console.log("📥 OTP:", otp);
  console.log("🕐 Server time:", new Date().toISOString());

  let user;
  try {
    user = await userRepository.findUserById(userId, { mfa_enabled: true });
    console.log("✅ Database query executed");
  } catch (dbError) {
    console.error("❌ Database error:", dbError);
    throw new Error("DATABASE_ERROR");
  }

  if (!user) {
    console.log("❌ USER NOT FOUND in database");
    throw new Error("USER_NOT_FOUND");
  }

  console.log("✅ User found:", {
    id: user.id,
    email: user.email,
    role: user.role,
    mfaEnabled: user.mfa_enabled,
    hasMfaSecret: !!user.mfa_secret,
  });

  if (!user.mfa_secret) {
    console.log("❌ MFA NOT SETUP - No secret found");
    throw new Error("MFA_NOT_SETUP");
  }

  // Clean the OTP
  const cleanOtp = otp.toString().trim().replace(/\s+/g, "").replace(/-/g, "");
  console.log("🧹 Cleaned OTP:", cleanOtp);

  // Generate what the current token SHOULD be
  const serverToken = speakeasy.totp({
    secret: user.mfa_secret,
    encoding: "base32",
  });
  console.log("🎯 Server expects token:", serverToken);
  console.log("📱 User provided token:", cleanOtp);
  console.log("🔍 Tokens match:", serverToken === cleanOtp);

  // Verify with multiple windows for debugging
  for (let window = 0; window <= 10; window++) {
    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: "base32",
      token: cleanOtp,
      window: window,
    });

    if (verified && window > 0) {
      console.log(
        `⚠️  Token verified with window=${window} (time drift detected)`,
      );
      break;
    }
  }

  // Actual verification with reasonable window
  const verified = speakeasy.totp.verify({
    secret: user.mfa_secret,
    encoding: "base32",
    token: cleanOtp,
    window: 10, // Very lenient for debugging - you can reduce this later
  });

  console.log("🔐 Verification Result:", verified);

  if (!verified) {
    console.log("❌ INVALID OTP - Verification failed");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    throw new Error("INVALID_OTP");
  }

  console.log("✅ MFA VERIFICATION SUCCESSFUL");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      plan: user.plan,
    },
  };
}

module.exports = {
  registerUserService,
  loginUserService,
  userProfileService,
  //upgradePlanService,
  getCurrentUser,
  setupMfaService,
  verifyMfaService,
  verifyCodeService,
  resendVerificationService,
  forgotPassword,
  verifyResetOtp,
  setNewPassword,
};
