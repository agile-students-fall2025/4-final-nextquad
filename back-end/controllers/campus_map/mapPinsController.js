const { mockMapPins, generateMockPin } = require('../../data/campus_map/mockMapPins');

//match rank calculation
const rank = (q, p) => {
  const title = (p.title || '').toLowerCase();
  const desc  = (p.desc  || '').toLowerCase();
  const keys  = (p.keywords || []).map(k => (k || '').toLowerCase());
  if (title.startsWith(q)) return 100;
  if (title.includes(q))   return 80;
  if (keys.includes(q))    return 70;
  if (keys.some(k => k.includes(q))) return 60;
  if (desc.includes(q))    return 40;
  return 0;
};

//get map point, for filter or search with filter
const getPoints = (req, res) => {
  try {
    const { categories, search, bbox } = req.query;
    let pins = mockMapPins.slice();

    //Filter by categories
    if (categories) {
      const wanted = new Set(
        categories.split(',').map(s => s.trim()).filter(Boolean)
      );
      pins = pins.filter(p => p.categories?.some(c => wanted.has(c)));
    }

    //Text search
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      pins = pins
        .map(p => ({ p, s: rank(q, p) }))
        .filter(x => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .map(x => x.p);
    }

    return res.status(200).json({
      success: true,
      count: pins.length,
      data: pins
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching map points'
    });
  }
};

//get point with id, use for clicking floating card
const getPointById = (req, res) => {
  try {
    const id = String(req.params.id);
    const pin = mockMapPins.find(p => p.id === id);
    if (!pin) {
      return res.status(404).json({ success: false, error: 'Map pin not found' });
    }
    return res.status(200).json({ success: true, data: pin });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error while fetching map pin' });
  }
};

//search point, for search bar
const searchPoints = (req, res) => {
  try {
    const q = (req.query.q || '').toLowerCase().trim();
    if (!q) return res.status(200).json({ success: true, count: 0, data: [] });

    const ranked = mockMapPins
      .map(p => ({ p, s: rank(q, p) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map(x => x.p);

    return res.status(200).json({
      success: true,
      count: ranked.length,
      data: ranked
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error while searching map points' });
  }
};

module.exports = {
  getPoints,
  getPointById,
  searchPoints
};
