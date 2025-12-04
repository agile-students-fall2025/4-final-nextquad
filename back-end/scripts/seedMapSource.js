/**
 * Script to seed the mapsource collection from mappins.json
 */

require('dotenv').config();
const mongoose = require('mongoose');
const MapSource = require('../models/MapSource');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nextquad';

async function seedMapSource() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Read the JSON file
    const jsonPath = path.join(__dirname, '../data/map/mappins.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const locations = JSON.parse(jsonData);

    console.log(`Found ${locations.length} locations in mappins.json`);

    // Clear existing data
    const deleted = await MapSource.deleteMany({});
    console.log(`Cleared ${deleted.deletedCount} existing documents\n`);

    // Insert new data
    console.log('Inserting locations...');
    const result = await MapSource.insertMany(locations);
    console.log(`✅ Successfully inserted ${result.length} locations\n`);

    // Show summary
    const categories = await MapSource.distinct('categories');
    console.log('Categories found:', categories.flat().filter((v, i, a) => a.indexOf(v) === i));

    await mongoose.connection.close();
    console.log('\n✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedMapSource();

