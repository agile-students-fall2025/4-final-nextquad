const { expect } = require("chai");
const { setupProfile } = require("../../controllers/login/profileSetupController");

describe("Profile Setup Controller", () => {
  it("should return 400 if required fields are missing", (done) => {
    const req = { body: { first: "John", nyuEmail: "jz123@nyu.edu" } };

    const res = {
      status: (code) => {
        expect(code).to.equal(400);
        return {
          json: (data) => {
            expect(data.success).to.be.false;
            expect(data.error).to.equal("All fields are required.");
            done();
          },
        };
      },
    };

    setupProfile(req, res);
  });

  it("should return 400 if email is not an NYU email", (done) => {
    const req = {
      body: {
        first: "John",
        last: "Zhou",
        nyuEmail: "john@gmail.com",
        gradYear: "2026",
      },
    };

    const res = {
      status: (code) => {
        expect(code).to.equal(400);
        return {
          json: (data) => {
            expect(data.success).to.be.false;
            expect(data.error).to.equal("Email must be an NYU email.");
            done();
          },
        };
      },
    };

    setupProfile(req, res);
  });

  it("should return 400 if graduation year is invalid", (done) => {
    const req = {
      body: {
        first: "John",
        last: "Zhou",
        nyuEmail: "jz123@nyu.edu",
        gradYear: "2020",
      },
    };

    const res = {
      status: (code) => {
        expect(code).to.equal(400);
        return {
          json: (data) => {
            expect(data.success).to.be.false;
            expect(data.error).to.equal(
              "Graduation year must be greater than 2024."
            );
            done();
          },
        };
      },
    };

    setupProfile(req, res);
  });

  it("should return 201 and profile data on success", (done) => {
    const req = {
      body: {
        first: "John",
        last: "Zhou",
        nyuEmail: "jz123@nyu.edu",
        gradYear: "2026",
        profileImage: "https://example.com/avatar.jpg",
      },
    };

    const res = {
      status: (code) => {
        expect(code).to.equal(201);
        return {
          json: (data) => {
            expect(data.success).to.be.true;
            expect(data.message).to.equal("Profile setup successful.");
            expect(data.data).to.include({
              first: "John",
              last: "Zhou",
              nyuEmail: "jz123@nyu.edu",
              gradYear: 2026,
            });
            expect(data.data.profileImage).to.be.a("string");
            done();
          },
        };
      },
    };

    setupProfile(req, res);
  });
});