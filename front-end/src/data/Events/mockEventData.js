export const mockEvents = [
  {
    id: 1,
    title: "Fall Music Festival",
    date: "2025-11-15",
    time: "7:00 PM",
    location: "Kimmel Center",
    category: ["Music", "Social"],
    rsvpCount: 24,
    description: "Join us for an evening of live music featuring student bands and local artists. Food and drinks will be provided.",
    image: "https://picsum.photos/400/300?random=1",
    host: { 
      name: "NYU Events Team", 
      avatar: "https://picsum.photos/50/50?random=10" 
    },
    // TODO Sprint 2: This should come from backend - check if current user is host
    isUserHost: true,
    // TODO Sprint 2: This should come from backend - check if user has RSVP'd
    hasUserRSVPed: false
  },
  {
    id: 2,
    title: "Study Group: Algorithms",
    date: "2025-10-28",
    time: "3:00 PM",
    location: "Bobst Library, Room 402",
    category: ["Study"],
    rsvpCount: 12,
    description: "Weekly algorithms study group. We'll be covering dynamic programming this week.",
    image: "https://picsum.photos/400/300?random=2",
    host: { 
      name: "CS Study Circle", 
      avatar: "https://picsum.photos/50/50?random=11" 
    },
    isUserHost: false,
    hasUserRSVPed: true
  },
  {
    id: 3,
    title: "Halloween Party",
    date: "2025-10-31",
    time: "9:00 PM",
    location: "Lipton Hall Lounge",
    category: ["Social", "Party"],
    rsvpCount: 45,
    description: "Come celebrate Halloween with costumes, music, and treats! Costume contest with prizes.",
    image: "https://picsum.photos/400/300?random=3",
    host: { 
      name: "Lipton Hall RA", 
      avatar: "https://picsum.photos/50/50?random=12" 
    },
    isUserHost: false,
    hasUserRSVPed: true
  },
  {
    id: 4,
    title: "Career Fair 2025",
    date: "2025-11-05",
    time: "10:00 AM",
    location: "Kimmel Center, Grand Ballroom",
    category: ["Career"],
    rsvpCount: 156,
    description: "Meet with top employers and explore internship and full-time opportunities.",
    image: "https://picsum.photos/400/300?random=4",
    host: { 
      name: "Career Development", 
      avatar: "https://picsum.photos/50/50?random=13" 
    },
    isUserHost: false,
    hasUserRSVPed: false
  }
];

export const categories = ['All', 'Music', 'Social', 'Study', 'Career', 'Wellness', 'Tech', 'Party'];

// TODO Sprint 2: Replace with backend API calls
// GET /api/events/user/rsvps - Get events user has RSVP'd to
// GET /api/events/user/hosting - Get events user is hosting
export const getUserRSVPedEvents = () => {
  return mockEvents.filter(event => event.hasUserRSVPed);
};

export const getUserHostedEvents = () => {
  return mockEvents.filter(event => event.isUserHost);
};