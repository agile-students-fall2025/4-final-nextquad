const { expect } = require("chai");
require("../testHelper"); // Setup database connection
const { signUpUser } = require("../../controllers/login/signUpController");
const User = require("../../models/User");
const { createMockResponse, createMockRequest } = require("../testHelper");

describe("Sign Up Controller", () => {
  // Clean up test users after each test
  afterEach(async () => {
    await User.deleteMany({ email: { $regex: /^testnewuser|brandnew/ } });
  });

  it("should return 400 if email or password is missing", (done) => {
    const req = createMockRequest({ body: { email: "testnewuser@example.com" } });
    const res = createMockResponse();

    signUpUser(req, res);

    setTimeout(() => {
      expect(res.statusCode).to.equal(400);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal("Email and password are required.");
      done();
    }, 100);
  });

  it("should return 409 if email already exists", async () => {
    // First create a user
    const existingEmail = "existinguser@example.com";
    const hashedPassword = require("bcryptjs").hashSync("password123", 10);
    await User.findOneAndUpdate(
      { email: existingEmail },
      {
        email: existingEmail,
        password: hashedPassword,
        firstName: "Existing",
        lastName: "User",
      },
      { upsert: true, new: true }
    );

    const req = createMockRequest({
      body: { email: existingEmail, password: "somepassword" },
    });
    const res = createMockResponse();

    await signUpUser(req, res);

    expect(res.statusCode).to.equal(409);
    expect(res.body.success).to.be.false;
    expect(res.body.message).to.equal("Email already registered.");
  });

  it("should return 201 and user data on successful sign-up", (done) => {
    const uniqueEmail = `brandnew${Date.now()}@example.com`;
    const req = createMockRequest({
      body: { email: uniqueEmail, password: "newpassword123" },
    });
    const res = createMockResponse();

    signUpUser(req, res);

    setTimeout(async () => {
      expect(res.statusCode).to.equal(201);
      expect(res.body.success).to.be.true;
      expect(res.body.message).to.equal("User created successfully");
      expect(res.body.data).to.have.property("email", uniqueEmail);
      expect(res.body.data).to.have.property("id");

      // Verify user exists in database
      const created = await User.findOne({ email: uniqueEmail });
      expect(created).to.not.be.null;
      expect(created.email).to.equal(uniqueEmail);
      done();
    }, 200);
  });
});
