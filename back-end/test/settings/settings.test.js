const { expect } = require("chai");
const {
  getUserSettings,
  updateUserSettings,
  getPrivacyPolicy,
  changeUserPassword,
} = require("../../controllers/settings/settingsController");

const {
  mockUserSettings,
  mockPrivacyPolicy,
} = require("../../data/settings/mockSettingsData");

// Helper to mock res
const mockResponse = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return {
      json: (data) => {
        res.body = data;
      },
    };
  };
  return res;
};

describe("Settings Controller Tests", () => {
  // Reset mock before each test run
  beforeEach(() => {
    mockUserSettings.notifications = {
      all: true,
      emergencyAlerts: true,
      roomReservations: false,
      commentReplies: true,
      lostAndFound: false,
      marketplace: true,
    };
  });

  // get user notification settings
  describe("GET User Settings", () => {
    it("should return user settings successfully", () => {
      const req = {};
      const res = mockResponse();

      getUserSettings(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.deep.equal(mockUserSettings);
    });
  });

  // update user notification settings
  describe("UPDATE User Settings", () => {
    it("should return 400 for invalid body", () => {
      const req = { body: null };
      const res = mockResponse();

      updateUserSettings(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.body.success).to.be.false;
    });

    it("should update a valid notification field", () => {
      const req = { body: { roomReservations: true } };
      const res = mockResponse();

      updateUserSettings(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(mockUserSettings.notifications.roomReservations).to.equal(true);
    });

    it("should update multiple valid fields", () => {
      const req = {
        body: {
          emergencyAlerts: false,
          marketplace: false,
        },
      };
      const res = mockResponse();

      updateUserSettings(req, res);

      expect(res.statusCode).to.equal(200);
      expect(mockUserSettings.notifications.emergencyAlerts).to.equal(false);
      expect(mockUserSettings.notifications.marketplace).to.equal(false);
    });
  });

  // get the current privacy policy
  describe("GET Privacy Policy", () => {
    it("should return privacy policy text", () => {
      const req = {};
      const res = mockResponse();

      getPrivacyPolicy(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.equal(mockPrivacyPolicy);
    });
  });

  // change user's password
  // should fail as passwrod database isnt set up yet 
  describe("CHANGE User Password", () => {
    it("should return 400 if any password field is missing", () => {
      const req = { body: { currentPassword: "" } };
      const res = mockResponse();

      changeUserPassword(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.body.success).to.be.false;
    });

    it("should return 400 if new password and confirmation do not match", () => {
      const req = {
        body: {
          currentPassword: "Password123",
          newPassword: "Password456",
          confirmPassword: "IncorrectMatch",
        },
      };
      const res = mockResponse();

      changeUserPassword(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.body.error).to.include("do not match");
    });

    it("should return 401 if current password is incorrect", () => {
      const req = {
        body: {
          currentPassword: "IncorrectPassword",
          newPassword: "NewPass123",
          confirmPassword: "NewPass123",
        },
      };
      const res = mockResponse();

      changeUserPassword(req, res);

      expect(res.statusCode).to.equal(401);
      expect(res.body.error).to.include("incorrect");
    });

    it("should successfully change password", () => {
      const req = {
        body: {
          currentPassword: "Password123",
          newPassword: "Password456",
          confirmPassword: "Password456",
        },
      };
      const res = mockResponse();

      changeUserPassword(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.message).to.include("successfully");
    });
  });
});
