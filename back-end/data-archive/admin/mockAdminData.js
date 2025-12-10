const { faker } = require("@faker-js/faker");

const mockAdminSettings = {
  id: faker.string.uuid(),
  notifications: {
    all: true,
    emergencyAlerts: true,
    userReports: false,
    newPosts: true,
  },
  updatedAt: new Date().toISOString(),
};

module.exports = { mockAdminSettings };
