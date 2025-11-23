const mongoose = require("mongoose");

/**
 * Host sub-schema for event host information
 */
const hostSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: 'https://picsum.photos/seed/default/50/50'
  },
  userId: {
    type: String,
    required: true
  }
}, { _id: false });

/**
 * RSVP sub-schema for tracking RSVPs
 */
const rsvpSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  rsvpedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

/**
 * Check-in sub-schema for tracking attendance
 */
const checkInSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  checkedInAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

/**
 * Survey sub-schema for event feedback
 */
const surveySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  enjoyedAspects: {
    type: [String],
    default: []
  },
  feedback: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

/**
 * Main Event Schema
 */
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          const validCategories = ['Music', 'Social', 'Study', 'Career', 'Wellness', 'Tech', 'Party'];
          return v.every(cat => validCategories.includes(cat));
        },
        message: 'Invalid category'
      }
    },
    description: {
      type: String,
      default: ''
    },
    date: {
      type: String,  // Store as "YYYY-MM-DD" format string for consistency with frontend
      required: true
    },
    time: {
      type: String,  // Store as "3:30 PM" format string for consistency with frontend
      required: true
    },
    location: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: function() {
        return `https://picsum.photos/seed/event${Date.now()}/400/300`;
      }
    },
    host: {
      type: hostSchema,
      required: true
    },
    rsvpCount: {
      type: Number,
      default: 0,
      min: 0
    },
    rsvps: {
      type: [rsvpSchema],
      default: []
    },
    checkIns: {
      type: [checkInSchema],
      default: []
    },
    surveys: {
      type: [surveySchema],
      default: []
    },
    isPast: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true,  // Automatically adds createdAt and updatedAt
    collection: 'events'  // Explicitly specify collection name (lowercase)
  }
);

/**
 * Virtual for getting attended count
 */
eventSchema.virtual('attendedCount').get(function() {
  return this.checkIns.length;
});

/**
 * Virtual for getting average rating
 */
eventSchema.virtual('averageRating').get(function() {
  if (this.surveys.length === 0) return null;
  const sum = this.surveys.reduce((acc, survey) => acc + survey.rating, 0);
  return (sum / this.surveys.length).toFixed(1);
});

/**
 * Method to check if event is within check-in window (24 hours before event)
 */
eventSchema.methods.isWithinCheckInWindow = function() {
  const eventDateTime = new Date(`${this.date} ${this.time}`);
  const now = new Date();
  const hoursDiff = (eventDateTime - now) / (1000 * 60 * 60);
  return hoursDiff <= 24 && hoursDiff >= 0;
};

/**
 * Method to check if user has RSVP'd
 */
eventSchema.methods.hasUserRSVPd = function(userId) {
  return this.rsvps.some(rsvp => rsvp.userId === userId);
};

/**
 * Method to check if user has checked in
 */
eventSchema.methods.hasUserCheckedIn = function(userId) {
  return this.checkIns.some(checkIn => checkIn.userId === userId);
};

/**
 * Method to check if user has submitted survey
 */
eventSchema.methods.hasUserSubmittedSurvey = function(userId) {
  return this.surveys.some(survey => survey.userId === userId);
};

/**
 * Method to check if user is the host
 */
eventSchema.methods.isHost = function(userId) {
  return this.host.userId === userId;
};

// Ensure virtuals are included when converting to JSON
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Event", eventSchema);
