const { faker } = require("@faker-js/faker");

//global mock admin 
global._mockAdmins = [
  {
    id: "admin-1",
    email: "admin@example.com",
    password: "adminpass",  
    name: "Adam Admin",
    createdAt: faker.date.past().toISOString(),
  },
];

const mockAdmins = global._mockAdmins;

module.exports = { mockAdmins };
