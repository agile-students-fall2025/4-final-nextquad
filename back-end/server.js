#!/usr/bin/env node
require("dotenv").config();
const server = require("./app"); // load up the web server
const port = process.env.PORT || 3000; // the port to listen to for incoming requests

// call express's listen function to start listening to the port
const listener = server.listen(port, function () {
  console.log(`Server running on port: ${port}`);
  console.log(`Available APIs:`);
  console.log(`  - Events: http://localhost:${port}/api/events`);
  console.log(`  - Feed:   http://localhost:${port}/api/feed`);
});

// a function to stop listening to the port
const close = () => {
  listener.close();
};

module.exports = {
  close: close,
};