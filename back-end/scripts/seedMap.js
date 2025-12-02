require('dotenv').config();
const mongoose = require('mongoose');
const MapPoint = require('../models/Map');
const testMapPoints = require('../data/campus_map/testMapPoints.json');

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nextquad';
  console.log(`[Seed] Connecting to ${uri}`);
  await mongoose.connect(uri);
  console.log('[Seed] Connected. Clearing existing map points collection...');

  await MapPoint.deleteMany({});

  // Valid categories (as defined in the Map model)
  const validCategories = ['study', 'fitness', 'dining', 'restroom', 'water', 'printer', 'charging', 'accessibility', 'help', 'event'];
  
  // Convert test data to match the schema (remove id field, MongoDB will generate _id)
  // Filter categories to only include valid categories
  const mapPointsData = testMapPoints.map(pin => {
    // Filter categories to only include valid ones
    const categories = (pin.categories || []).filter(cat => validCategories.includes(cat));
    
    return {
      title: pin.title,
      x: pin.x,
      y: pin.y,
      desc: pin.desc || '',
      hours: pin.hours || '',
      categories: categories.length > 0 ? categories : [],
      keywords: pin.keywords || [],
      building: pin.building || '',
      link: pin.link || ''
    };
  });

  console.log(`[Seed] Inserting ${mapPointsData.length} map points...`);
  await MapPoint.insertMany(mapPointsData);

  console.log('[Seed] Database seeded ✔');
  await mongoose.connection.close();
}

run().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});

