// Map locations
export const POINTS = [
  { id: 1, title: "Kimmel Center",           x: 52, y: 28,
    hours: "8:00-22:00", desc: "Lorem ipsum dolor sit amet.",
    categories: ["wheelchair", "elevator", "autodoor", "hearingloop"] },

  { id: 2, title: "Silver Center",           x: 46, y: 32,
    hours: "9:00-18:00", desc: "Consectetur adipiscing elit.",
    categories: ["wheelchair", "stepfree", "elevator", "braille"] },

  { id: 3, title: "GCASL",                   x: 58, y: 36,
    hours: "7:30-21:00", desc: "Sed do eiusmod tempor.",
    categories: ["wheelchair", "elevator", "autodoor"] },

  { id: 4, title: "Bobst Library",           x: 50, y: 42,
    hours: "Open 24 hours", desc: "Ut labore et dolore magna aliqua.",
    categories: ["wheelchair", "stepfree", "elevator", "autodoor", "braille", "hearingloop"] },

  { id: 5, title: "Center for Data Science", x: 63, y: 48,
    hours: "9:00-19:00", desc: "Ut enim ad minim veniam.",
    categories: ["wheelchair", "elevator", "autodoor"] },

  { id: 6, title: "John A. Paulson Center",  x: 38, y: 56,
    hours: "6:00-23:00", desc: "Quis nostrud exercitation ullamco.",
    categories: ["wheelchair", "stepfree", "elevator", "autodoor", "hearingloop"] },

  { id: 7, title: "Lipton Hall",             x: 30, y: 70,
    hours: "10:00-20:00", desc: "Laboris nisi ut aliquip.",
    categories: ["wheelchair", "elevator", "autodoor", "braille"] },
];



// Categoris in dropdown menu
export const CATEGORIES = [
    { id: "wheelchair",  label: "Wheelchair Accessible" },
    { id: "stepfree",    label: "Step-Free Routes" },
    { id: "autodoor",    label: "Automatic Doors" },
    { id: "elevator",    label: "Elevator Access" },
    { id: "braille",     label: "Braille Signage" },
    { id: "hearingloop", label: "Hearing Loop" },
];
  