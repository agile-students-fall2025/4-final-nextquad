// import and instantiate express
const express = require("express"); // CommonJS import style!
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
require("dotenv").config(); // Load environment variables

const app = express(); // instantiate an Express object

const jwt = require('jsonwebtoken')
const passport = require('passport')

// use this JWT strategy within passport for authentication handling
const jwtStrategy = require('./config/jwt-config.js') // import setup options for using JWT in passport
passport.use(jwtStrategy)

// tell express to use passport middleware
app.use(passport.initialize())

// mongoose models for MongoDB data manipulation
const mongoose = require('mongoose')
const admin = require('./models/Admin.js')

// connect to the database
// console.log(`Connecting to MongoDB at ${process.env.MONGODB_URI}`)
try {
  mongoose.connect(process.env.MONGODB_URI)
  console.log(`Connected to MongoDB.`)
} catch (err) {
  console.log(
    `Error connecting to MongoDB Admin account authentication will fail: ${err}`
  )
}

// Middleware
app.use(
  morgan("dev", { skip: (req, res) => process.env.NODE_ENV === "test" })
);
app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: '50mb' })); // Parse JSON request bodies (increased limit for multiple image uploads)
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Parse URL-encoded bodies
app.use(cookieParser());

// Import routes
const eventsRoutes = require("./routes/events/events");
const feedRoutes = require("./routes/feed/feed");
const settingsRoutes = require("./routes/settings/settings");
const adminRoutes = require("./routes/admin/admin");
const mapRoutes = require("./routes/campus_map/campus_map");
const loginRoutes = require("./routes/login/login");

// API Routes
app.use("/api/events", eventsRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/map", mapRoutes);
app.use("/api/auth", loginRoutes);
app.use("/api/admin", adminRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "NextQuad Backend API",
    version: "1.0.0",
    endpoints: {
      events: "/api/events",
      feed: "/api/feed",
      settings: "/api/settings",
      map: "/api/map",
      auth: "/api/auth", 
      map: "/api/map",
      admin: "/api/admin",
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});

// export the express app we created to make it available to other modules
module.exports = app;