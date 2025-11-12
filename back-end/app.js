// import and instantiate express
const express = require("express"); // CommonJS import style!
const cors = require("cors");
require("dotenv").config(); // Load environment variables

const app = express(); // instantiate an Express object

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Import routes
const eventsRoutes = require("./routes/events/events");
const feedRoutes = require("./routes/feed/feed");
const settingsRoutes = require("./routes/settings/settings");
const mapRoutes = require("./routes/campus_map/campus_map");
const loginRoutes = require("./routes/login/login");

// API Routes
app.use("/api/events", eventsRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/map", mapRoutes);
app.use("/api/auth", loginRoutes);

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
      auth: "/api/auth" 
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