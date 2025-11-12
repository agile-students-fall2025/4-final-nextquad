const { expect } = require("chai");
const { signIn } = require("../../controllers/login/signInController");
const { mockUsers } = require("../../data/login/mockLogInData");

describe("Sign In Controller", () => {
  it("should return 400 if email or password is missing", (done) => {
    const req = { body: { email: "student@example.com" } };

    const res = {
      status: (code) => {
        expect(code).to.equal(400);
        return {
          json: (data) => {
            expect(data.success).to.be.false;
            expect(data.error).to.equal("Email and password are required.");
            done();
          },
        };
      },
    };

    signIn(req, res);
  });

  it("should return 401 for invalid credentials", (done) => {
    const req = {
      body: { email: "student@example.com", password: "wrongpass" },
    };

    const res = {
      status: (code) => {
        expect(code).to.equal(401);
        return {
          json: (data) => {
            expect(data.success).to.be.false;
            expect(data.error).to.equal("Invalid email or password.");
            done();
          },
        };
      },
    };

    signIn(req, res);
  });

  it("should return 200 and user data for valid credentials", (done) => {
    const req = {
      body: { email: "student@example.com", password: "password123" },
    };

    const res = {
      status: (code) => {
        expect(code).to.equal(200);
        return {
          json: (data) => {
            expect(data.success).to.be.true;
            expect(data.data).to.include({
              email: "student@example.com",
              name: "Test User",
            });
            expect(data.message).to.equal("Login successful");
            done();
          },
        };
      },
    };

    signIn(req, res);
  });
});