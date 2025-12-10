const { expect } = require("chai");
require("../testHelper"); // Setup database connection
const { signIn } = require("../../controllers/login/signInController");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const { createMockResponse, createMockRequest } = require("../testHelper");

describe("Sign In Controller", () => {
  let testUser;

  // Create a test user before tests
  before(async () => {
    const testEmail = "teststudent@example.com";
    const testPassword = "testpassword123";
    
    // Check if user exists, if not create one
    testUser = await User.findOne({ email: testEmail });
    if (!testUser) {
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      testUser = new User({
        email: testEmail,
        password: hashedPassword,
        firstName: "Test",
        lastName: "User",
      });
      await testUser.save();
    }
  });

  it("should return 400 if email or password is missing", (done) => {
    const req = createMockRequest({ body: { email: "teststudent@example.com" } });
    const res = createMockResponse();

    signIn(req, res);

    setTimeout(() => {
      expect(res.statusCode).to.equal(400);
      expect(res.body.success).to.be.false;
      expect(res.body.error).to.equal("Email and password are required.");
      done();
    }, 100);
  });

  it("should return 401 for invalid credentials", (done) => {
    const req = createMockRequest({
      body: { email: "teststudent@example.com", password: "wrongpass" },
    });
    const res = createMockResponse();

    signIn(req, res);

    setTimeout(() => {
      expect(res.statusCode).to.equal(401);
      expect(res.body.success).to.be.false;
      expect(res.body.error).to.equal("Invalid email or password.");
      done();
    }, 100);
  });

  it("should return 200 and user data for valid credentials", (done) => {
    const req = createMockRequest({
      body: { email: "teststudent@example.com", password: "testpassword123" },
    });
    const res = createMockResponse();

    signIn(req, res);

    setTimeout(() => {
      expect(res.statusCode).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.have.property("email", "teststudent@example.com");
      expect(res.body.message).to.equal("Login successful");
      done();
    }, 100);
  });
});
