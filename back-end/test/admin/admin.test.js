const { expect } = require("chai");

const {
  getAdminSettings,
  updateAdminSettings,
  getAllReports,
  createReport,
  getEmergencyAlerts,
  createEmergencyAlert,
  adminSignIn,
} = require("../../controllers/admin/adminController");

const { mockAdminSettings } = require("../../data/admin/mockAdminData");
const { mockReports } = require("../../data/admin/mockReportData");
const { mockAlerts } = require("../../data/admin/mockAlertData");
const { mockAdmins } = require("../../data/admin/mockAdminData");

// request helper 
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

describe("ADMIN CONTROLLER TESTS", () => {
  // Reset mock data before each test
  beforeEach(() => {
    mockAdminSettings.notifications = {
      all: true,
      emergencyAlerts: true,
      userReports: false,
      newPosts: true,
    };
  });

  // get admin settings
  describe("GET Admin Settings", () => {
    it("should return admin settings successfully", () => {
      const req = {};
      const res = mockResponse();

      getAdminSettings(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.deep.equal(mockAdminSettings);
    });
  });

  // update admin settings
  describe("UPDATE Admin Settings", () => {
    it("should return 400 for invalid body", () => {
      const req = { body: null };
      const res = mockResponse();

      updateAdminSettings(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.body.success).to.be.false;
    });

    it("should update a valid notification field", () => {
      const req = { body: { userReports: true } };
      const res = mockResponse();

      updateAdminSettings(req, res);

      expect(res.statusCode).to.equal(200);
      expect(mockAdminSettings.notifications.userReports).to.equal(true);
    });
  });

  // get all reported users 
  describe("GET All User Reports", () => {
    it("should return all reported users", () => {
      const req = {};
      const res = mockResponse();

      getAllReports(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.equal(mockReports);
    });
  });

  // create a user report
  describe("CREATE User Report", () => {
    it("should return 400 if username or reason is missing", () => {
      const req = { body: { username: "" } };
      const res = mockResponse();

      createReport(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.body.success).to.be.false;
    });

    it("should create a new report successfully", () => {
      const req = {
        body: {
          username: "TestUser",
          reason: "Inappropriate behavior",
        },
      };
      const res = mockResponse();

      const initialCount = mockReports.length;

      createReport(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.body.success).to.be.true;
      expect(mockReports.length).to.equal(initialCount + 1);
      expect(res.body.data.username).to.equal("TestUser");
    });
  });

  // get emergency alerts
  describe("GET Emergency Alerts", () => {
    it("should return alerts successfully", () => {
      const req = {};
      const res = mockResponse();

      getEmergencyAlerts(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.equal(mockAlerts);
    });
  });

  // create an emergency alert
  describe("CREATE Emergency Alert", () => {
    it("should return 400 if message missing", () => {
      const req = { body: { message: "   " } };
      const res = mockResponse();

      createEmergencyAlert(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.body.error).to.include("Message is required");
    });

    it("should create a new emergency alert", () => {
      const req = { body: { message: "Fire Drill" } };
      const res = mockResponse();

      const initialCount = mockAlerts.length;

      createEmergencyAlert(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.body.success).to.be.true;
      expect(mockAlerts.length).to.equal(initialCount + 1);
      expect(res.body.data.message).to.equal("Fire Drill");
    });
  });

  // single admin sign in 
  describe("Admin Sign-In", () => {
    it("should return 400 if email or password missing", () => {
      const req = { body: { email: "" } };
      const res = mockResponse();

      adminSignIn(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.body.success).to.be.false;
    });

    it("should return 401 for invalid credentials", () => {
      const req = {
        body: {
          email: "student@example.com",
          password: "passwordiswrong",
        },
      };
      const res = mockResponse();

      adminSignIn(req, res);

      expect(res.statusCode).to.equal(401);
      expect(res.body.success).to.be.false;
    });

    it("should sign in successfully with correct credentials", () => {
      const req = {
        body: {
          email: "admin@example.com",
          password: "adminpass",
        },
      };
      const res = mockResponse();

      adminSignIn(req, res);

      expect(res.statusCode).to.equal(undefined);
      expect(res.body.success).to.be.true;
      expect(res.body.data.email).to.equal(admin.email);
    });
  });
});
