const mongoose = require("mongoose");

/**
 * Map Category Schema
 * Stores the available categories for campus map points
 */
const mapCategorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    label: {
      type: String,
      required: true,
      trim: true
    }
  },
  { 
    timestamps: true,  
    collection: 'mapcategories'  
  }
);

mapCategorySchema.index({ id: 1 }, { unique: true });

mapCategorySchema.set('toJSON', { virtuals: true });
mapCategorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("MapCategory", mapCategorySchema);

