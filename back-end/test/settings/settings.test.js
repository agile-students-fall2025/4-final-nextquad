const { expect } = require("chai");
require("../testHelper"); // Setup database connection
const {
  getUserSettings,
  updateUserSettings,
  getPrivacyPolicy,
  changeUserPassword,
} = require("../../controllers/settings/settingsController");
const User = require("../../models/User");
const UserSettings = require("../../models/UserSettings");
const PrivacyPolicy = require("../../models/PrivacyPolicy");
const bcrypt = require("bcryptjs");
const { createMockResponse, createMockRequest } = require("../testHelper");

describe("Settings Controller Tests", () => {
  let testUser;
  let testUserId;

  // Create a test user before tests
  before(async () => {
    const testEmail = "settingstestuser@example.com";
    testUser = await User.findOne({ email: testEmail });
    if (!testUser) {
      const hashedPassword = await bcrypt.hash("Password123", 10);
      testUser = new User({
        email: testEmail,
        password: hashedPassword,
        firstName: "Settings",
        lastName: "TestUser",
      });
      await testUser.save();
    }
    testUserId = testUser._id.toString();
  });

  // get user notification settings
  describe("GET User Settings", () => {
    it("should return user settings successfully", (done) => {
      const req = createMockRequest({ user: { userId: testUserId } });
      const res = createMockResponse();

      getUserSettings(req, res);

      setTimeout(() => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.success).to.be.true;
        expect(res.body.data).to.have.property("notifications");
        done();
      }, 100);
    });
  });

  // update user notification settings
  describe("UPDATE User Settings", () => {
    it("should return 400 for invalid body", (done) => {
      const req = createMockRequest({ user: { userId: testUserId }, body: null });
      const res = createMockResponse();

      updateUserSettings(req, res);

      setTimeout(() => {
        expect(res.statusCode).to.equal(400);
        expect(res.body.success).to.be.false;
        done();
      }, 100);
    });

    it("should update a valid notification field", async () => {
      const req = createMockRequest({
        user: { userId: testUserId },
        body: { roomReservations: true },
      });
      const res = createMockResponse();

      await updateUserSettings(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.body.success).to.be.true;

      // Verify in database
      const settings = await UserSettings.findOne({ user: testUserId });
      if (settings) {
        expect(settings.notifications.roomReservations).to.equal(true);
      }
    });
  });

  // get the current privacy policy
  describe("GET Privacy Policy", () => {
    it("should return privacy policy text", (done) => {
      const req = createMockRequest({});
      const res = createMockResponse();

      getPrivacyPolicy(req, res);

      setTimeout(() => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.success).to.be.true;
        expect(res.body.data).to.be.a("string");
        done();
      }, 100);
    });
  });

  // change user's password
  describe("CHANGE User Password", () => {
    it("should return 400 if any password field is missing", (done) => {
      const req = createMockRequest({
        user: { userId: testUserId },
        body: { currentPassword: "" },
      });
      const res = createMockResponse();

      changeUserPassword(req, res);

      setTimeout(() => {
        expect(res.statusCode).to.equal(400);
        expect(res.body.success).to.be.false;
        done();
      }, 100);
    });

    it("should return 400 if new password and confirmation do not match", (done) => {
      const req = createMockRequest({
        user: { userId: testUserId },
        body: {
          currentPassword: "Password123",
          newPassword: "Password456",
          confirmPassword: "IncorrectMatch",
        },
      });
      const res = createMockResponse();

      changeUserPassword(req, res);

      setTimeout(() => {
        expect(res.statusCode).to.equal(400);
        expect(res.body.error).to.include("do not match");
        done();
      }, 100);
    });

    it("should return 401 if current password is incorrect", (done) => {
      const req = createMockRequest({
        user: { userId: testUserId },
        body: {
          currentPassword: "IncorrectPassword",
          newPassword: "NewPass123",
          confirmPassword: "NewPass123",
        },
      });
      const res = createMockResponse();

      changeUserPassword(req, res);

      setTimeout(() => {
        expect(res.statusCode).to.equal(401);
        expect(res.body.error).to.include("incorrect");
        done();
      }, 100);
    });
  });
});
