let lastVerifiedEmail = null;

function setLastVerifiedEmail(email) {
  lastVerifiedEmail = email;
}

function getLastVerifiedEmail() {
  return lastVerifiedEmail;
}

function clearLastVerifiedEmail() {
  lastVerifiedEmail = null;
}

module.exports = {
  setLastVerifiedEmail,
  getLastVerifiedEmail,
  clearLastVerifiedEmail,
};