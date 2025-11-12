const { expect } = require("chai");
const { verifyCode } = require("../../controllers/login/verifyCodeController");

describe("Verify Code Controller", () => {
  it("should return 400 if code is missing", (done) => {
    const req = { body: {} };

    const res = {
      status: (code) => {
        expect(code).to.equal(400);
        return {
          json: (data) => {
            expect(data.success).to.be.false;
            expect(data.error).to.include("Verification code");
            done();
          },
        };
      },
    };

    verifyCode(req, res);
  });

  it("should return 400 if code is not 4 digits long", (done) => {
    const req = { body: { code: "12" } };

    const res = {
      status: (code) => {
        expect(code).to.equal(400);
        return {
          json: (data) => {
            expect(data.success).to.be.false;
            expect(data.error).to.include("4 numeric digits");
            done();
          },
        };
      },
    };

    verifyCode(req, res);
  });

  it("should return 401 if code is incorrect", (done) => {
    const req = { body: { code: "9999" } };

    const res = {
      status: (code) => {
        expect(code).to.equal(401);
        return {
          json: (data) => {
            expect(data.success).to.be.false;
            expect(data.error).to.equal("Incorrect verification code.");
            done();
          },
        };
      },
    };

    verifyCode(req, res);
  });

  it("should return 200 if code is correct", (done) => {
    const req = { body: { code: "1234" } };

    const res = {
      status: (code) => {
        expect(code).to.equal(200);
        return {
          json: (data) => {
            expect(data.success).to.be.true;
            expect(data.message).to.include("Verification successful");
            done();
          },
        };
      },
    };

    verifyCode(req, res);
  });
});