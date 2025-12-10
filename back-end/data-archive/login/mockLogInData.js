// data/login/mockLogInData.js
const { faker } = require("@faker-js/faker");


if (!global._mockUsers) {
  global._mockUsers = [
    {
      id: 1,
      email: "student@example.com",
      password: "password123", // plaintext for mock only
      name: "Test User",
      createdAt: faker.date.past().toISOString(),
    },
    {
      id: 2,
      email: "admin@example.com",
      password: "adminpass",
      name: "Admin User",
      createdAt: faker.date.past().toISOString(),
    },
    // Auto-generate a few random users for realism
    ...Array.from({ length: 3 }).map(() => ({
      id: faker.number.int({ min: 100, max: 999 }),
      email: faker.internet.email(),
      password: faker.internet.password({ length: 10 }),
      name: faker.person.fullName(),
      createdAt: faker.date.past().toISOString(),
    })),
  ];
}


const mockUsers = global._mockUsers;

// --- Helper: find user by email ---
const findUserByEmail = (email) => mockUsers.find((u) => u.email === email);

// --- Helper: create a new mock user (for Sign-Up) ---
const createMockUser = (email, password) => {
  const newUser = {
    id: faker.string.uuid(),
    email,
    password,
    name: faker.person.fullName(),
    createdAt: new Date().toISOString(),
  };
  mockUsers.push(newUser); // simulate DB insert
  return newUser;
};

module.exports = { mockUsers, findUserByEmail, createMockUser };

console.log("[MockData] mockUsers initialized:", global._mockUsers?.length || 0);

module.exports = { 
  mockUsers, 
  findUserByEmail, 
  createMockUser 
};