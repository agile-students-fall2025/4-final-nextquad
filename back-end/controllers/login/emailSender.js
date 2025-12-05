const nodemailer = require("nodemailer");

// Step 1: 创建 transporter 并打印配置
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log("📦 EMAIL_USER:", process.env.EMAIL_USER);
console.log("🔐 EMAIL_PASS:", process.env.EMAIL_PASS ? "[HIDDEN]" : "❌ NOT SET");

// Step 2: 检查 transporter 配置是否有效
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ Email transporter connection failed:", error);
  } else {
    console.log("✅ Email transporter is ready to send messages");
  }
});

const sendVerificationEmail = async (toEmail, code) => {
  const mailOptions = {
    from: `"NextQuad Auth" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your Password Reset Code",
    text: `Your verification code is: ${code}\nIt will expire in 10 minutes.`,
  };

  console.log("📨 Preparing to send email to:", toEmail);
  console.log("📨 Email content:", mailOptions.text);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.response);
  } catch (err) {
    console.error("❌ Failed to send email:", err);
  }
};

module.exports = { sendVerificationEmail };