const mongoose = require("mongoose");

const mapPointSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    x: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    y: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    desc: {
      type: String,
      default: ''
    },
    hours: {
      type: String,
      default: ''
    },
    categories: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          const validCategories = ['study', 'fitness', 'dining', 'restroom', 'water', 'printer', 'charging', 'accessibility', 'help', 'event'];
          return v.every(cat => validCategories.includes(cat));
        },
        message: 'Invalid category'
      }
    },
    keywords: {
      type: [String],
      default: []
    },
    building: {
      type: String,
      default: ''
    },
    link: {
      type: String,
      default: ''
    }
  },
  { 
    timestamps: true,
    collection: 'mappoints'  
  }
);

mapPointSchema.set('toJSON', { virtuals: true });
mapPointSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("MapPoint", mapPointSchema);
