const { expect } = require("chai");
const mongoose = require("mongoose");
require("../testHelper"); // Setup database connection
const {
  getAdminSettings,
  updateAdminSettings,
  getAllReports,
  createReport,
  getEmergencyAlerts,
  createEmergencyAlert,
  adminSignIn,
} = require("../../controllers/admin/adminController");
const Admin = require("../../models/Admin");
const AdminSettings = require("../../models/AdminSettings");
const AdminReportUser = require("../../models/AdminReportUser");
const AdminEmergencyAlert = require("../../models/AdminEmergencyAlert");
const { createMockResponse, createMockRequest } = require("../testHelper");

describe("ADMIN CONTROLLER TESTS", () => {
  let testAdmin;
  let testAdminId;

  // Create a test admin before tests
  before(async () => {
    // Create or find a test admin
    testAdmin = await Admin.findOne({ email: "testadmin@example.com" });
    if (!testAdmin) {
      testAdmin = new Admin({
        email: "testadmin@example.com",
        password: "$2b$10$rQZ8vK9JX8vK9JX8vK9JXeK9JX8vK9JX8vK9JX8vK9JX8vK9JXu", // hashed password
      });
      await testAdmin.save();
    }
    testAdminId = testAdmin._id;
  });

  // Clean up test data after each test
  afterEach(async () => {
    await AdminReportUser.deleteMany({ username: { $regex: /^TestUser/ } });
    await AdminEmergencyAlert.deleteMany({ message: { $regex: /^Test Alert|Fire Drill/ } });
  });

  // get admin settings
  describe("GET Admin Settings", () => {
    it("should return admin settings successfully", async () => {
      const req = createMockRequest({ user: { _id: testAdminId } });
      const res = createMockResponse();

      await getAdminSettings(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.have.property("notifications");
    });
  });

  // update admin settings
  describe("UPDATE Admin Settings", () => {
    it("should return 400 for invalid body", async () => {
      const req = createMockRequest({ user: { _id: testAdminId }, body: null });
      const res = createMockResponse();

      await updateAdminSettings(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.body.success).to.be.false;
    });

    it("should update a valid notification field", async () => {
      const req = createMockRequest({
        user: { _id: testAdminId },
        body: { notifications: { userReports: true } },
      });
      const res = createMockResponse();

      await updateAdminSettings(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.body.success).to.be.true;

      // Verify in database
      const settings = await AdminSettings.findOne({ admin: testAdminId });
      expect(settings.notifications.userReports).to.equal(true);
    });
  });

  // get all reported users
  describe("GET All User Reports", () => {
    it("should return all reported users", async () => {
      const req = createMockRequest({ user: { _id: testAdminId } });
      const res = createMockResponse();

      await getAllReports(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an("array");
    });
  });

  // create a user report
  describe("CREATE User Report", () => {
    it("should return 400 if username or reason is missing", async () => {
      const req = createMockRequest({
        user: { _id: testAdminId },
        body: { username: "" },
      });
      const res = createMockResponse();

      await createReport(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.body.success).to.be.false;
    });

    it("should create a new report successfully", async () => {
      const req = createMockRequest({
        user: { _id: testAdminId },
        body: {
          username: "TestUser" + Date.now(),
          reason: "Inappropriate behavior",
        },
      });
      const res = createMockResponse();

      await createReport(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.have.property("username");
    });
  });

  // get emergency alerts
  describe("GET Emergency Alerts", () => {
    it("should return alerts successfully", async () => {
      const req = createMockRequest({ user: { _id: testAdminId } });
      const res = createMockResponse();

      await getEmergencyAlerts(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an("array");
    });
  });

  // create an emergency alert
  describe("CREATE Emergency Alert", () => {
    it("should return 400 if message missing", async () => {
      const req = createMockRequest({
        user: { _id: testAdminId },
        body: { message: "   " },
      });
      const res = createMockResponse();

      await createEmergencyAlert(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.body.error).to.include("Message is required");
    });

    it("should create a new emergency alert", async () => {
      const req = createMockRequest({
        user: { _id: testAdminId },
        body: { message: "Test Alert " + Date.now() },
      });
      const res = createMockResponse();

      await createEmergencyAlert(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.have.property("message");
    });
  });

  // admin sign in
  describe("Admin Sign-In", () => {
    it("should return 400 if email or password missing", async () => {
      const req = createMockRequest({ body: { email: "" } });
      const res = createMockResponse();

      await adminSignIn(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.body.success).to.be.false;
    });

    it("should return 401 for invalid credentials", async () => {
      const req = createMockRequest({
        body: {
          email: "nonexistent@example.com",
          password: "wrongpassword",
        },
      });
      const res = createMockResponse();

      await adminSignIn(req, res);

      expect(res.statusCode).to.equal(401);
      expect(res.body.success).to.be.false;
    });
  });
});
