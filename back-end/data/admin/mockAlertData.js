const { faker } = require("@faker-js/faker");

const mockAlerts = [
  {
    id: faker.string.uuid(),
    message: "Severe weather warning — campus closed.",
    sentAt: new Date().toISOString(),
    sentBy: "Admin",
  },
  {
    id: faker.string.uuid(),
    message: "Fire drill scheduled at 2 PM.",
    sentAt: new Date().toISOString(),
    sentBy: "System",
  },
];

module.exports = { mockAlerts };