/**
 * Geocoding Service
 * Converts addresses to coordinates using Google Maps Geocoding API
 */

const axios = require('axios');

/**
 * Geocode an address to lat/lng coordinates
 * @param {string} address - Full address string
 * @returns {Promise<{lat: number, lng: number}>}
 */
async function geocodeAddress(address) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.warn('[geocodeAddress] GOOGLE_MAPS_API_KEY not set in environment variables!');
    console.warn('[geocodeAddress] Add GOOGLE_MAPS_API_KEY to your back-end/.env file');
    // Return default NYU campus coordinates as fallback
    return { lat: 40.7308, lng: -73.9973 };
  }

  try {
    // Add "New York, NY" to help with geocoding accuracy
    const fullAddress = `${address}, New York, NY`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`;
    
    const response = await axios.get(url);
    
    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    } else if (response.data.status === 'REQUEST_DENIED') {
      console.error(`[geocodeAddress] API request denied. Check your API key and ensure Geocoding API is enabled.`);
      console.error(`[geocodeAddress] Status: ${response.data.status}, Error: ${response.data.error_message || 'Unknown error'}`);
      return { lat: 40.7308, lng: -73.9973 };
    } else {
      console.warn(`[geocodeAddress] Geocoding failed for "${address}": ${response.data.status}`);
      if (response.data.error_message) {
        console.warn(`[geocodeAddress] Error message: ${response.data.error_message}`);
      }
      // Return default NYU campus coordinates as fallback
      return { lat: 40.7308, lng: -73.9973 };
    }
  } catch (error) {
    console.error(`[geocodeAddress] Error geocoding "${address}":`, error.message);
    if (error.response) {
      console.error(`[geocodeAddress] Response status: ${error.response.status}`);
      console.error(`[geocodeAddress] Response data:`, error.response.data);
    }
    // Return default NYU campus coordinates as fallback
    return { lat: 40.7308, lng: -73.9973 };
  }
}

module.exports = {
  geocodeAddress
};

