const { faker } = require("@faker-js/faker");

// fake report user data 
const mockReports = [
  {
    id: faker.string.uuid(),
    username: faker.internet.userName(),
    reason: "Inappropriate behavior in chat",
    reportedAt: new Date().toISOString(),
  },
  {
    id: faker.string.uuid(),
    username: faker.internet.userName(),
    reason: "Spamming in comments",
    reportedAt: new Date().toISOString(),
  },
];

// Export mock data
module.exports = { mockReports };
