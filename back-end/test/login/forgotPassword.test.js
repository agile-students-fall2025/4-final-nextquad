const { expect } = require("chai");
const { sendResetCode } = require("../../controllers/login/forgotPasswordController");

describe("Forgot Password Controller", () => {
  it("should return 400 if email is missing", (done) => {
    const req = { body: {} };

    const res = {
      status: (code) => {
        expect(code).to.equal(400);
        return {
          json: (data) => {
            expect(data.success).to.be.false;
            expect(data.error).to.equal("Valid email required.");
            done();
          },
        };
      },
    };

    sendResetCode(req, res);
  });

  it("should return 400 if email format is invalid", (done) => {
    const req = { body: { email: "invalidemail" } };

    const res = {
      status: (code) => {
        expect(code).to.equal(400);
        return {
          json: (data) => {
            expect(data.success).to.be.false;
            expect(data.error).to.equal("Valid email required.");
            done();
          },
        };
      },
    };

    sendResetCode(req, res);
  });

  it("should return 200 and confirmation message if email is valid", (done) => {
    const req = { body: { email: "student@example.com" } };

    const res = {
      status: (code) => {
        expect(code).to.equal(200);
        return {
          json: (data) => {
            expect(data.success).to.be.true;
            expect(data.message).to.equal("Verification code sent.");
            done();
          },
        };
      },
    };

    sendResetCode(req, res);
  });
});