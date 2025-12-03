/**
 * Seed script for Events demo data
 * Creates users with names, events with RSVPs, check-ins, and surveys
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Event = require('../models/Event');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing events...');
    await Event.deleteMany({});
    
    // Update users with names (keep existing users, just add names)
    console.log('Updating users with names...');
    
    const userUpdates = [
      { email: 'newuser@nyu.edu', firstName: 'Alice', lastName: 'Johnson' },
      { email: 'test@nyu.edu', firstName: 'Bob', lastName: 'Smith' },
      { email: 'xz3837@nyu.edu', firstName: 'Xiao', lastName: 'Zhang' },
      { email: 'user1@example.com', firstName: 'Charlie', lastName: 'Brown' },
      { email: '1@nyu.edu', firstName: 'Diana', lastName: 'Lee' },
      { email: '123@nyu.edu', firstName: 'Emma', lastName: 'Wilson' },
      { email: 'a@nyu.edu', firstName: 'Frank', lastName: 'Davis' },
      { email: 'user2@example.com', firstName: 'Grace', lastName: 'Miller' },
      { email: '1q@nyu.edu', firstName: 'Henry', lastName: 'Taylor' },
    ];

    for (const update of userUpdates) {
      await User.findOneAndUpdate(
        { email: update.email },
        { firstName: update.firstName, lastName: update.lastName }
      );
    }

    // Get all users for RSVPs
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    // Create demo events
    console.log('Creating demo events...');

    // Valid categories: 'Music', 'Social', 'Study', 'Career', 'Wellness', 'Tech', 'Party'
    const events = [
      // Past event (with surveys completed)
      {
        title: 'NYU Tech Career Fair 2024',
        description: 'Annual tech career fair featuring top companies like Google, Meta, Amazon, and more. Network with recruiters and learn about internship and full-time opportunities.',
        date: '2025-11-20',
        time: '2:00 PM',
        location: 'Kimmel Center, 60 Washington Square S',
        category: ['Career', 'Tech'],
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        host: {
          name: 'Alice Johnson',
          avatar: 'https://i.pravatar.cc/150?u=alice',
          userId: users[0]?._id.toString() || 'user1'
        },
        rsvps: users.slice(0, 5).map(u => ({
          userId: u._id.toString(),
          rsvpDate: new Date('2025-11-15')
        })),
        checkIns: users.slice(0, 4).map(u => ({
          userId: u._id.toString(),
          checkInTime: new Date('2025-11-20T14:30:00')
        })),
        surveys: users.slice(0, 3).map((u, i) => ({
          userId: u._id.toString(),
          rating: 4 + (i % 2),
          enjoyedAspects: ['Networking', 'Company booths'],
          feedback: 'Great event! Met lots of recruiters.',
          submittedAt: new Date('2025-11-21')
        })),
        isPast: true
      },

      // Past event (recent, needs survey)
      {
        title: 'Thanksgiving Potluck Dinner',
        description: 'Celebrate Thanksgiving with fellow students! Bring a dish to share and enjoy good food and company.',
        date: '2025-11-28',
        time: '6:00 PM',
        location: 'Palladium Hall, 140 E 14th St',
        category: ['Social', 'Party'],
        image: 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=800',
        host: {
          name: 'Bob Smith',
          avatar: 'https://i.pravatar.cc/150?u=bob',
          userId: users[1]?._id.toString() || 'user2'
        },
        rsvps: users.slice(1, 7).map(u => ({
          userId: u._id.toString(),
          rsvpDate: new Date('2025-11-25')
        })),
        checkIns: users.slice(1, 6).map(u => ({
          userId: u._id.toString(),
          checkInTime: new Date('2025-11-28T18:15:00')
        })),
        surveys: [],
        isPast: true
      },

      // Today's event
      {
        title: 'Study Session: Final Exam Prep',
        description: 'Group study session for finals. Bring your notes and questions!',
        date: '2025-12-02',
        time: '7:00 PM',
        location: 'Bobst Library, 70 Washington Square S',
        category: ['Study', 'Social'],
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
        host: {
          name: 'Xiao Zhang',
          avatar: 'https://i.pravatar.cc/150?u=xiao',
          userId: users[2]?._id.toString() || 'user3'
        },
        rsvps: users.slice(2, 8).map(u => ({
          userId: u._id.toString(),
          rsvpDate: new Date('2025-12-01')
        })),
        checkIns: [],
        surveys: [],
        isPast: false
      },

      // Upcoming - Check-in available (Dec 10, 8pm EST)
      {
        title: 'Winter Coding Workshop',
        description: 'Learn web development basics with React and Node.js. Perfect for beginners! Laptops required.',
        date: '2025-12-10',
        time: '8:00 PM',
        location: 'GCASL, 7 E 12th St, Room 375',
        category: ['Tech', 'Career'],
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
        host: {
          name: 'Charlie Brown',
          avatar: 'https://i.pravatar.cc/150?u=charlie',
          userId: users[3]?._id.toString() || 'user4'
        },
        rsvps: users.slice(0, 8).map(u => ({
          userId: u._id.toString(),
          rsvpDate: new Date('2025-12-05')
        })),
        checkIns: [],
        surveys: [],
        isPast: false
      },

      // Upcoming - Check-in available (Dec 17, 8pm EST)
      {
        title: 'End of Semester Party',
        description: 'Celebrate the end of fall semester with music, food, and fun! DJ, photo booth, and prizes.',
        date: '2025-12-17',
        time: '8:00 PM',
        location: 'Rooftop at 60 Washington Square S',
        category: ['Party', 'Music'],
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
        host: {
          name: 'Diana Lee',
          avatar: 'https://i.pravatar.cc/150?u=diana',
          userId: users[4]?._id.toString() || 'user5'
        },
        rsvps: users.slice(0, 9).map(u => ({
          userId: u._id.toString(),
          rsvpDate: new Date('2025-12-10')
        })),
        checkIns: [],
        surveys: [],
        isPast: false
      },

      // Future event
      {
        title: '2025 Spring Welcome Back Mixer',
        description: 'Welcome back to campus! Meet new friends, reconnect with old ones, and start the semester right.',
        date: '2026-01-20',
        time: '5:00 PM',
        location: 'Kimmel Center, 60 Washington Square S',
        category: ['Social', 'Wellness'],
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
        host: {
          name: 'Emma Wilson',
          avatar: 'https://i.pravatar.cc/150?u=emma',
          userId: users[5]?._id.toString() || 'user6'
        },
        rsvps: users.slice(3, 6).map(u => ({
          userId: u._id.toString(),
          rsvpDate: new Date('2025-12-20')
        })),
        checkIns: [],
        surveys: [],
        isPast: false
      },

      // Another future event
      {
        title: 'Wellness Wednesday: Yoga & Meditation',
        description: 'De-stress with a relaxing yoga and meditation session. All levels welcome. Mats provided.',
        date: '2025-12-18',
        time: '12:00 PM',
        location: 'Palladium Athletic Facility',
        category: ['Wellness'],
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
        host: {
          name: 'Grace Miller',
          avatar: 'https://i.pravatar.cc/150?u=grace',
          userId: users[7]?._id.toString() || 'user8'
        },
        rsvps: users.slice(0, 4).map(u => ({
          userId: u._id.toString(),
          rsvpDate: new Date('2025-12-15')
        })),
        checkIns: [],
        surveys: [],
        isPast: false
      }
    ];

    // Insert events
    for (const eventData of events) {
      const event = new Event({
        ...eventData,
        rsvpCount: eventData.rsvps.length
      });
      await event.save();
      console.log(`  Created: ${eventData.title} (${eventData.date}) - ${eventData.rsvps.length} RSVPs`);
    }

    console.log('\n✅ Seed completed successfully!');
    console.log(`Created ${events.length} events`);
    console.log(`Updated ${userUpdates.length} users with names`);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();

