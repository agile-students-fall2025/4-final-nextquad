import { faker } from '@faker-js/faker';

// TODO Sprint 2: All mock data should be replaced with backend API calls
// This file uses '@faker-js/faker' package for mock data generation per requirements

// Event categories
export const categories = ['All', 'Music', 'Social', 'Study', 'Career', 'Wellness', 'Tech', 'Party'];

// NYU campus locations for more realistic events
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

// Seed faker for consistent results (optional - remove for truly random data each time)
faker.seed(123);

// Generate a random event using faker
const generateMockEvent = (id, isPastEvent = false) => {
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
    // Generate past date (1-30 days ago)
    eventDate = faker.date.recent({ days: 30, refDate: today });
  } else {
    // Generate future date (0-60 days from now)
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
  const description = faker.lorem.sentences(faker.number.int({ min: 1, max: 3 }));
  
  // Generate host
  const hostType = faker.helpers.arrayElement(['person', 'organization']);
  const hostName = hostType === 'person' 
    ? faker.person.fullName()
    : `${faker.lorem.words(faker.number.int({ min: 1, max: 2 }))} ${faker.helpers.arrayElement(['Club', 'Society', 'Team', 'Organization', 'Group'])}`;

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
      avatar: `https://picsum.photos/seed/host${id}/50/50`
    },
    // TODO Sprint 2: This should come from backend - check if current user is host
    isUserHost: id === 1, // First event is hosted by user for demo
    // TODO Sprint 2: This should come from backend - check if user has RSVP'd
    hasUserRSVPed: [2, 3, 100].includes(id), // Some events user has RSVP'd to for demo
    // TODO Sprint 2: Backend will determine these statuses
    needsCheckIn: id === 2 && !isPastEvent, // Event 2 needs check-in (upcoming)
    needsSurvey: id === 100 && isPastEvent, // Event 100 needs survey (past event)
    isPast: isPastEvent
  };
};

// Generate mock events
// 5 upcoming events
const upcomingEvents = Array.from({ length: 5 }, (_, index) => generateMockEvent(index + 1, false));

// 1 past event (for analytics demo)
const pastEvents = Array.from({ length: 1 }, (_, index) => generateMockEvent(index + 100, true));

// Combine all events
export const mockEvents = [...upcomingEvents, ...pastEvents];

// TODO Sprint 2: Replace with backend API calls
// GET /api/events/user/rsvps - Get events user has RSVP'd to (attending)
export const getUserRSVPedEvents = () => {
  return mockEvents.filter(event => event.hasUserRSVPed && !event.isPast);
};

// GET /api/events/user/hosting - Get events user is hosting
export const getUserHostedEvents = () => {
  return mockEvents.filter(event => event.isUserHost && !event.isPast);
};

// GET /api/events/user/needs-attention - Get events needing user action
// This includes both upcoming events needing check-in AND past events needing survey
export const getEventsNeedingAttention = () => {
  return mockEvents.filter(event => 
    event.hasUserRSVPed && (event.needsCheckIn || event.needsSurvey)
  );
};

// GET /api/events/user/past - Get user's past events
export const getUserPastEvents = () => {
  return mockEvents.filter(event => event.hasUserRSVPed && event.isPast);
};