const MapSource = require('../../models/MapSource');
const { geocodeAddress } = require('../../services/geocodingService');

//get map point, for filter or search with filter
const getPoints = async (req, res) => {
  try {
    const { categories, search } = req.query;
    const query = {};

    // Filter by categories
    if (categories) {
      const wanted = categories.split(',').map(s => s.trim()).filter(Boolean);
      query.categories = { $in: wanted };
      console.log('[getPoints] Filtering by categories:', wanted);
    }

    // Text search - search in title, desc, keywords, and building
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { desc: searchRegex },
        { building: searchRegex },
        { keywords: { $in: [searchRegex] } }
      ];
    }

    console.log('[getPoints] MongoDB query:', JSON.stringify(query, null, 2));
    const pins = await MapSource.find(query).lean();
    console.log('[getPoints] Found', pins.length, 'pins');

    // Geocode all addresses - process all points in parallel
    console.log(`[getPoints] Geocoding ${pins.length} addresses...`);
    
    const formattedPins = await Promise.all(pins.map(async (pin) => {
      let lat = pin.latitude;
      let lng = pin.longitude;

      // If coordinates are missing, geocode the address
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        if (pin.address && pin.address.trim()) {
          try {
            const coords = await geocodeAddress(pin.address);
            lat = coords.lat;
            lng = coords.lng;

            // Update database with geocoded coordinates (even if fallback, to avoid repeated API calls)
            await MapSource.findByIdAndUpdate(pin._id, {
              latitude: lat,
              longitude: lng
            });
            
            if (lat !== 40.7308 || lng !== -73.9973) {
              console.log(`[getPoints] ✅ Geocoded: ${pin.title} -> ${lat}, ${lng}`);
            }
          } catch (error) {
            console.error(`[getPoints] Geocoding failed for ${pin.title}:`, error.message);
            lat = 40.7308;
            lng = -73.9973;
          }
        } else {
          console.warn(`[getPoints] No address for ${pin.title}`);
          lat = 40.7308;
          lng = -73.9973;
        }
      }

      return {
        id: pin._id.toString(),
        title: pin.title,
        address: pin.address || '',
        latitude: Number(lat),
        longitude: Number(lng),
        desc: pin.desc || '',
        hours: pin.hours || '',
        categories: pin.categories || [],
        keywords: pin.keywords || [],
        building: pin.building || '',
        link: pin.link || ''
      };
    }));
    
    // Log summary
    const uniqueCoords = new Set(formattedPins.map(p => `${p.latitude},${p.longitude}`));
    console.log(`[getPoints] ✅ Processed ${formattedPins.length} points with ${uniqueCoords.size} unique coordinates`);
    
    if (uniqueCoords.size === 1 && formattedPins.length > 1) {
      console.warn('[getPoints] ⚠️  WARNING: All points have the same coordinates! Check geocoding API key.');
    }

    return res.status(200).json({
      success: true,
      count: formattedPins.length,
      data: formattedPins
    });
  } catch (err) {
    console.error('[getPoints] error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching map points'
    });
  }
};

//get point with id, use for clicking floating card
const getPointById = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Try to find by MongoDB _id first
    let pin = await MapSource.findById(id).lean();
    
    // If not found by _id, try to find by a numeric id field (for backward compatibility)
    if (!pin) {
      pin = await MapSource.findOne({ id: id }).lean();
    }

    if (!pin) {
      return res.status(404).json({ 
        success: false, 
        error: 'Map pin not found' 
      });
    }

    // Geocode if coordinates are missing
    let lat = pin.latitude;
    let lng = pin.longitude;

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      if (pin.address && pin.address.trim()) {
        try {
          const coords = await geocodeAddress(pin.address);
          lat = coords.lat;
          lng = coords.lng;
          await MapSource.findByIdAndUpdate(pin._id, {
            latitude: lat,
            longitude: lng
          });
        } catch (error) {
          console.error(`[getPointById] Geocoding failed:`, error.message);
          lat = 40.7308;
          lng = -73.9973;
        }
      } else {
        lat = 40.7308;
        lng = -73.9973;
      }
    }

    const formattedPin = {
      id: pin._id.toString(),
      title: pin.title,
      address: pin.address || '',
      latitude: Number(lat),
      longitude: Number(lng),
      desc: pin.desc || '',
      hours: pin.hours || '',
      categories: pin.categories || [],
      keywords: pin.keywords || [],
      building: pin.building || '',
      link: pin.link || ''
    };

    return res.status(200).json({ 
      success: true, 
      data: formattedPin 
    });
  } catch (err) {
    console.error('[getPointById] error:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching map pin' 
    });
  }
};

//search point, for search bar
const searchPoints = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      return res.status(200).json({ 
        success: true, 
        count: 0, 
        data: [] 
      });
    }

    const searchRegex = new RegExp(q, 'i');
    const query = {
      $or: [
        { title: searchRegex },
        { desc: searchRegex },
        { building: searchRegex },
        { keywords: { $in: [searchRegex] } }
      ]
    };

    const pins = await MapSource.find(query).lean();

    // ranking prioritize title matches, then desc/keywords
    // Also geocode addresses that don't have coordinates
    const ranked = await Promise.all(
      pins
        .map(pin => {
          const title = (pin.title || '').toLowerCase();
          const desc = (pin.desc || '').toLowerCase();
          const keywords = (pin.keywords || []).map(k => k.toLowerCase());
          const qLower = q.toLowerCase();
          
          let score = 0;
          if (title.startsWith(qLower)) score = 100;
          else if (title.includes(qLower)) score = 80;
          else if (keywords.includes(qLower)) score = 70;
          else if (keywords.some(k => k.includes(qLower))) score = 60;
          else if (desc.includes(qLower)) score = 40;
          
          return { pin, score };
        })
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(async (x) => {
          let lat = x.pin.latitude;
          let lng = x.pin.longitude;

          // Geocode if coordinates are missing
          if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
            if (x.pin.address && x.pin.address.trim()) {
              try {
                const coords = await geocodeAddress(x.pin.address);
                lat = coords.lat;
                lng = coords.lng;
                await MapSource.findByIdAndUpdate(x.pin._id, {
                  latitude: lat,
                  longitude: lng
                });
              } catch (error) {
                console.error(`[searchPoints] Geocoding failed:`, error.message);
                lat = 40.7308;
                lng = -73.9973;
              }
            } else {
              lat = 40.7308;
              lng = -73.9973;
            }
          }

          return {
            id: x.pin._id.toString(),
            title: x.pin.title,
            address: x.pin.address || '',
            latitude: Number(lat),
            longitude: Number(lng),
            desc: x.pin.desc || '',
            hours: x.pin.hours || '',
            categories: x.pin.categories || [],
            keywords: x.pin.keywords || [],
            building: x.pin.building || '',
            link: x.pin.link || ''
          };
        })
    );

    return res.status(200).json({
      success: true,
      count: ranked.length,
      data: ranked
    });
  } catch (err) {
    console.error('[searchPoints] error:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while searching map points' 
    });
  }
};

module.exports = {
  getPoints,
  getPointById,
  searchPoints
};
