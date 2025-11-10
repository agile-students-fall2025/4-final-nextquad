const { faker } = require('@faker-js/faker');

//categories
const MAP_CATEGORIES = [
    { id: 'study',         label: 'Study Spaces' },
    { id: 'fitness',       label: 'Fitness' },
    { id: 'dining',        label: 'Dining' },
    { id: 'restroom',      label: 'Restrooms' },
    { id: 'water',         label: 'Water Fountains' },
    { id: 'printer',       label: 'Printers' },
    { id: 'charging',      label: 'Charging' },
    { id: 'accessibility', label: 'Accessibility' },  
    { id: 'help',          label: 'Help Desk' },
    { id: 'event',         label: 'Event Venue' } 
  ];

//campus building names
const NYU_BUILDINGS = [
    'Kimmel Center',
    'Bobst Library',
    'Lipton Hall Lounge',
    'Stern School',
    'Tisch Building',
    'Silver Center',
    'Courant Institute',
    'Palladium Athletic Facility',
    'Weinstein Hall',
    'Washington Square Park'
  ];

//buildings by types
const TITLES_BY_CATEGORY = {
    study:         ['Quiet Study Area', 'Collaborative Study Zone', 'Silent Reading Room'],
    fitness:       ['Fitness Center', 'Cardio Room', 'Weight Room'],
    dining:        ['Café', 'Food Court', 'Grab-n-Go'],
    restroom:      ['Restroom', 'All-Gender Restroom', 'Accessible Restroom'],
    water:         ['Water Fountain', 'Bottle Refill Station'],
    printer:       ['Printer', 'Print & Copy'],
    charging:      ['Charging Station', 'USB Charging Hub', 'Laptop Charging Bar'],
    accessibility: ['Elevator', 'Ramp Entrance', 'Braille Map'],
    help:          ['Help Desk', 'Info Desk', 'Student Services'],
    event:         ['Event Hall', 'Multi-purpose Room', 'Auditorium']
  };


//randomly generate map pins
faker.seed(10127);
const pick = (arr) => faker.helpers.arrayElement(arr);

//generate hours
const randomHours = () => {
  if (faker.number.int({ min: 1, max: 8 }) === 1) return '24/7';
  const openH  = faker.number.int({ min: 7, max: 10 });
  const closeH = faker.number.int({ min: 19, max: 23 });
  const toTime = (h) => `${h}:00`;
  return `${toTime(openH)}-${toTime(closeH)}`;
};

//generate categories
const randomCategories = () => {
  const ids = MAP_CATEGORIES.map(c => c.id);
  const n   = faker.number.int({ min: 1, max: 3 });
  const chosen = new Set();
  while (chosen.size < n) chosen.add(pick(ids));
  const arr = [];
  for (const v of chosen) arr.push(v);
  return arr;
};

//generate coordinates
const randomCoord = () => {
  const pad = 3; 
  const rand = () => Number(faker.number.float({ min: pad, max: 100 - pad, precision: 0.1 }).toFixed(1));
  return { x: rand(), y: rand() };
};

const generateMockPin = (id) => {
    const categories = randomCategories();
    const primary = categories[0];
    const titlePrefix = pick(TITLES_BY_CATEGORY[primary] || ['Location']);
    const building = pick(NYU_BUILDINGS);
    const title = `${building} ${titlePrefix}`;
  
    const { x, y } = randomCoord();
  
    const buildingLower = building.toLowerCase();
    const titleWords = titlePrefix.toLowerCase().split(/\s+/);
    
    let keywords = [buildingLower];
    keywords = keywords.concat(titleWords).concat(categories);
  
    return {
      id: String(id),
      x, y,
      title,
      desc: faker.lorem.sentence() + ' ' + faker.lorem.sentence(),
      hours: randomHours(),
      categories,
      keywords,
      building,
      updatedAt: new Date()
    };
  };
const mockMapPins = Array.from({ length: 30 }, (_, i) => generateMockPin(i + 1));

module.exports = {
    MAP_CATEGORIES,
    mockMapPins,
    generateMockPin
};