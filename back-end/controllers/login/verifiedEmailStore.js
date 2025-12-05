console.log("📌 Loaded verifiedEmailStore.js from:", __filename);

// 🟦 Use ONE global store shared by all controllers
if (!global.resetCodeStore) {
  global.resetCodeStore = {}; // email -> { code, expiresAt }
}

function saveResetCode(email, code) {
  global.resetCodeStore[email] = {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // expires in 10 minutes
  };

  console.log("💾 Saved reset code:", global.resetCodeStore[email]);
}

function getResetCodeData(email) {
  return global.resetCodeStore[email];
}

function clearResetCode(email) {
  delete global.resetCodeStore[email];
  console.log("🧹 Cleared reset code for:", email);
}

module.exports = {
  saveResetCode,
  getResetCodeData,
  clearResetCode,
};