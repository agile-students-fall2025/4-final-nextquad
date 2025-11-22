#!/usr/bin/env node
require("dotenv").config();
const server = require("./app"); // load up the web server
const port = process.env.PORT || 3000; // the port to listen to for incoming requests
const mongoose = require("mongoose");

// Connect to MongoDB
async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Missing MONGODB_URI in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");
  } catch (err) {
    console.error(
      "Error connecting to MongoDB. Authentication may fail:",
      err.message
    );
  }
}

let listener;

async function startServer() {
  await connectDB();

  listener = server.listen(port, function () {
    console.log(`Server running on port: ${port}`);
    console.log(`Available APIs:`);
    console.log(`  - Events: http://localhost:${port}/api/events`);
    console.log(`  - Feed:   http://localhost:${port}/api/feed`);
    console.log(`  - Settings: http://localhost:${port}/api/settings`);
    console.log(`  - Map: http://localhost:${port}/api/map`);
    console.log(`  - Auth: http://localhost:${port}/api/auth`);
    console.log(`  - Admin: http://localhost:${port}/api/admin`);
  });
}

const close = () => {
  if (listener) listener.close();
  mongoose.connection.close();
};

module.exports = { close };

startServer();