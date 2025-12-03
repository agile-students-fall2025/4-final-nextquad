const MapCategory = require('../../models/MapCategory');

/**
 * GET /api/map/categories
 * Get all available map categories from database
 */
const getCategories = async (req, res) => {
  try {
    const categories = await MapCategory.find({}).sort({ label: 1 }).lean();
    
    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    console.error('[getCategories] error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching map categories'
    });
  }
};

module.exports = { getCategories };
