const { expect } = require("chai");
const { resetPassword } = require("../../controllers/login/resetPasswordController");

describe("Reset Password Controller", () => {
  it("should return 400 if passwords are missing", (done) => {
    const req = { body: {} };

    const res = {
      status: (code) => {
        expect(code).to.equal(400);
        return {
          json: (data) => {
            expect(data.success).to.be.false;
            expect(data.error).to.include("required");
            done();
          },
        };
      },
    };

    resetPassword(req, res);
  });

  it("should return 400 if passwords do not match", (done) => {
    const req = { body: { newPassword: "abc123", confirmPassword: "xyz789" } };

    const res = {
      status: (code) => {
        expect(code).to.equal(400);
        return {
          json: (data) => {
            expect(data.success).to.be.false;
            expect(data.error).to.equal("Passwords do not match.");
            done();
          },
        };
      },
    };

    resetPassword(req, res);
  });

  it("should return 200 if password reset is successful", (done) => {
    const req = { body: { newPassword: "abc123", confirmPassword: "abc123" } };

    const res = {
      status: (code) => {
        expect(code).to.equal(200);
        return {
          json: (data) => {
            expect(data.success).to.be.true;
            expect(data.message).to.equal(
              "Password has been successfully reset."
            );
            done();
          },
        };
      },
    };

    resetPassword(req, res);
  });
});