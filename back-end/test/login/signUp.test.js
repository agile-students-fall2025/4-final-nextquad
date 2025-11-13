const { expect } = require("chai");
const { signUpUser } = require("../../controllers/login/signUpController");
const {
  mockUsers,
  findUserByEmail,
} = require("../../data/login/mockLogInData");

describe("Sign Up Controller", () => {
  it("should return 400 if email or password is missing", (done) => {
    const req = { body: { email: "newuser@example.com" } };

    const res = {
      status: (code) => {
        expect(code).to.equal(400);
        return {
          json: (data) => {
            expect(data.success).to.be.false;
            expect(data.message).to.equal("Email and password are required.");
            done();
          },
        };
      },
    };

    signUpUser(req, res);
  });

  it("should return 409 if email already exists", (done) => {
    const existingEmail = mockUsers[0].email;
    const req = { body: { email: existingEmail, password: "somepassword" } };

    const res = {
      status: (code) => {
        expect(code).to.equal(409);
        return {
          json: (data) => {
            expect(data.success).to.be.false;
            expect(data.message).to.equal("Email already registered.");
            done();
          },
        };
      },
    };

    signUpUser(req, res);
  });

  it("should return 201 and mock user data on successful sign-up", (done) => {
    const req = {
      body: { email: "brandnew@example.com", password: "newpassword123" },
    };

    const res = {
      status: (code) => {
        expect(code).to.equal(201);
        return {
          json: (data) => {
            expect(data.success).to.be.true;
            expect(data.message).to.equal("User created successfully");
            expect(data.data).to.have.property("id");
            expect(data.data).to.have.property("email", "brandnew@example.com");
            expect(data.data).to.have.property("name");
            expect(data.data).to.have.property("createdAt");

            const created = findUserByEmail("brandnew@example.com");
            expect(created).to.not.be.undefined;
            done();
          },
        };
      },
    };

    signUpUser(req, res);
  });
});