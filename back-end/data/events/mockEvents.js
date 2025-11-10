const { faker } = require('@faker-js/faker');

// Event categories
const categories = ['All', 'Music', 'Social', 'Study', 'Career', 'Wellness', 'Tech', 'Party'];

// NYU campus locations
const nyuLocations = [
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

// Event title prefixes by category
const eventTitlesByCategory = {
  'Music': ['Concert', 'Open Mic Night', 'Band Practice', 'Music Festival', 'DJ Night'],
  'Social': ['Mixer', 'Game Night', 'Movie Night', 'Party', 'Gathering'],
  'Study': ['Study Group', 'Review Session', 'Workshop', 'Tutoring Session', 'Office Hours'],
  'Career': ['Career Fair', 'Networking Event', 'Info Session', 'Panel Discussion', 'Interview Prep'],
  'Wellness': ['Yoga Session', 'Meditation Workshop', 'Fitness Class', 'Health Fair', 'Wellness Workshop'],
  'Tech': ['Hackathon', 'Tech Talk', 'Coding Workshop', 'Demo Day', 'Tech Meetup'],
  'Party': ['Celebration', 'Theme Party', 'Dance Party', 'Social Gathering', 'Festival']
};

// Seed faker for consistent results
faker.seed(123);

// Generate a random event using faker
const generateMockEvent = (id, isPastEvent = false, isUserHosted = false) => {
  // Pick random categories (1-2 categories per event)
  const availableCategories = categories.filter(cat => cat !== 'All');
  const numCategories = faker.number.int({ min: 1, max: 2 });
  const eventCategories = [];
  for (let i = 0; i < numCategories; i++) {
    const remainingCategories = availableCategories.filter(c => !eventCategories.includes(c));
    if (remainingCategories.length > 0) {
      const category = faker.helpers.arrayElement(remainingCategories);
      eventCategories.push(category);
    }
  }

  // Generate event title based on category
  const primaryCategory = eventCategories[0];
  const titlePrefix = faker.helpers.arrayElement(eventTitlesByCategory[primaryCategory]);
  const titleSuffix = faker.lorem.words(faker.number.int({ min: 1, max: 3 }));
  const title = `${titlePrefix}: ${titleSuffix}`;

  // Generate date (future or past based on parameter)
  const today = new Date();
  let eventDate;
  if (isPastEvent) {
    eventDate = faker.date.recent({ days: 30, refDate: today });
  } else {
    eventDate = faker.date.soon({ days: 60, refDate: today });
  }
  const date = eventDate.toISOString().split('T')[0];

  // Generate time
  const hour = faker.number.int({ min: 8, max: 21 });
  const minute = faker.helpers.arrayElement(['00', '15', '30', '45']);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const time = `${displayHour}:${minute} ${ampm}`;

  // Generate location
  const building = faker.helpers.arrayElement(nyuLocations);
  const hasRoom = faker.datatype.boolean();
  const location = hasRoom ? `${building}, Room ${faker.number.int({ min: 100, max: 599 })}` : building;

  // Generate other fields
  const rsvpCount = faker.number.int({ min: 5, max: 200 });
  const description = faker.lorem.sentences(faker.number.int({ min: 2, max: 4 }));
  
  // Generate host
  const hostType = faker.helpers.arrayElement(['person', 'organization']);
  const hostName = hostType === 'person' 
    ? faker.person.fullName()
    : `${faker.lorem.words(faker.number.int({ min: 1, max: 2 }))} ${faker.helpers.arrayElement(['Club', 'Society', 'Team', 'Organization', 'Group'])}`;

  // Mock user ID for host (simulate authentication)
  const hostUserId = isUserHosted ? 'user123' : `user${faker.number.int({ min: 1, max: 100 })}`;

  return {
    id,
    title,
    date,
    time,
    location,
    category: eventCategories,
    rsvpCount,
    description,
    image: `https://picsum.photos/seed/event${id}/400/300`,
    host: { 
      name: hostName,
      avatar: `https://picsum.photos/seed/host${id}/50/50`,
      userId: hostUserId
    },
    isPast: isPastEvent,
    createdAt: faker.date.recent({ days: 90 }),
    updatedAt: new Date()
  };
};

// Generate initial mock events (matching frontend)
// 5 upcoming events (IDs 1-5)
const upcomingEvents = Array.from({ length: 5 }, (_, index) => {
  // First event (ID 1) is hosted by the mock user
  return generateMockEvent(index + 1, false, index === 0);
});

// 1 past event (ID 100) for analytics demo
const pastEvents = Array.from({ length: 1 }, (_, index) => {
  return generateMockEvent(index + 100, true, false);
});

// Combine all events
let mockEvents = [...upcomingEvents, ...pastEvents];

// Make event 2 happen in 18 hours (for check-in demo - always within 24hr window)
const soon = new Date();
soon.setHours(soon.getHours() + 18);
if (mockEvents.length > 1) {
  mockEvents[1].date = soon.toISOString().split('T')[0];
  // Format time to 12-hour format
  const hours = soon.getHours();
  const minutes = soon.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  mockEvents[1].time = `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

// Mock RSVP data (stores which user RSVP'd to which events)
// Key: eventId, Value: array of userIds who RSVP'd
let mockRSVPs = {
  2: ['user123'], // Mock user RSVP'd to event 2 (this one needs check-in if within 24hrs)
  3: ['user123'], // Mock user RSVP'd to event 3
  100: ['user123'], // Mock user RSVP'd to past event 100 (needs survey)
};

// Helper function to get next event ID
const getNextEventId = () => {
  return Math.max(...mockEvents.map(e => e.id)) + 1;
};

module.exports = {
  categories,
  mockEvents,
  mockRSVPs,
  getNextEventId,
  generateMockEvent
};

