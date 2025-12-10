const { faker } = require('@faker-js/faker');

// Mock privacy policy — will be replaced with real one later
const mockPrivacyPolicy = {
  id: 1,
  title: "Privacy Policy",
  content: faker.lorem.paragraphs(5),
  lastUpdated: new Date().toISOString(),
};

// Mock user settings
const mockUserSettings = {
  id: faker.string.uuid(),
  notifications: {
    all: true,
    emergencyAlerts: true,
    roomReservations: false,
    commentReplies: true,
    lostAndFound: false,
    marketplace: true,
  },
  updatedAt: new Date().toISOString(),
};

module.exports = { mockPrivacyPolicy, mockUserSettings };