const mongoose = require("mongoose");

const mapPointSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    buildingCode: { type: String },
    category: { type: [String], default: [] }, 
    coordinates: {
      lat: Number,
      lng: Number
    },
    accessibility: {
      wheelchair: Boolean,
      elevator: Boolean,
      braille: Boolean
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MapPoint", mapPointSchema);
