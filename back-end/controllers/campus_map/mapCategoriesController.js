const { MAP_CATEGORIES } = require('../../data/campus_map/mockMapPins');

const getCategories = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      count: MAP_CATEGORIES.length,
      data: MAP_CATEGORIES
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching map categories'
    });
  }
};

module.exports = { getCategories };
