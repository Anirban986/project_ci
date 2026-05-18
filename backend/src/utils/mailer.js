const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendForgotPasswordOTP = async (email, otp) => {
  try {
    await sgMail.send({
      to: email,
      from: process.env.EMAIL,
      subject: "Password Reset OTP",
      html: `<h2>Your OTP is: ${otp}</h2>`
    });
    console.log("✅ Forgot password OTP sent to:", email);
  } catch (err) {
    console.error("Forgot password email error:", err.message);
    // don't throw
  }
  console.log(`Forgot password OTP for ${email}: ${otp}`);
};