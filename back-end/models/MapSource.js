const mongoose = require("mongoose");

/**
 * MapSource model - stores location data with addresses
 * Coordinates (latitude/longitude) will be geocoded from addresses
 */
const mapSourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    building: {
      type: String,
      default: ''
    },
    categories: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          const validCategories = ['academic', 'events', 'fitness', 'residential', 'student life', 'study'];
          return v.every(cat => validCategories.includes(cat));
        },
        message: 'Invalid category'
      }
    },
    keywords: {
      type: [String],
      default: []
    },
    desc: {
      type: String,
      default: ''
    },
    hours: {
      type: String,
      default: ''
    },
    link: {
      type: String,
      default: ''
    },
    // Geocoded coordinates (added when needed)
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    }
  },
  { 
    timestamps: true,
    collection: 'mappins' 
  }
);

mapSourceSchema.set('toJSON', { virtuals: true });
mapSourceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("MapSource", mapSourceSchema);

