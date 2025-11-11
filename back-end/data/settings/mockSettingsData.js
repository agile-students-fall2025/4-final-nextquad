import { faker } from '@faker-js/faker';


// Mock privacy policy-- will be replaced with real one later
export const mockPrivacyPolicy = {
  id: 1,
  title: "Privacy Policy",
  content: faker.lorem.paragraphs(5),
  lastUpdated: new Date().toISOString()
};

// Mock user settings-- will be filled in in next task 