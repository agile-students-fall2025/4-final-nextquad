const { expect } = require('chai');
const { mockEvents, getNextEventId } = require('../../data/events/mockEvents');
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../../controllers/events/eventsController');

describe('Events Controller', () => {
  
  describe('getAllEvents', () => {
    it('should return all events with success status', () => {
      const req = { query: {} };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getAllEvents(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.data.success).to.be.true;
      expect(res.data.data).to.be.an('array');
      expect(res.data.count).to.be.a('number');
    });

    it('should filter events by category', () => {
      const req = { query: { category: 'Tech' } };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getAllEvents(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.data.success).to.be.true;
      res.data.data.forEach(event => {
        expect(event.category).to.include('Tech');
      });
    });

    it('should filter events by search term', () => {
      const searchTerm = 'Concert';
      const req = { query: { search: searchTerm } };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getAllEvents(req, res);

      expect(res.statusCode).to.equal(200);
      res.data.data.forEach(event => {
        expect(event.title.toLowerCase()).to.include(searchTerm.toLowerCase());
      });
    });

    it('should only show upcoming events by default', () => {
      const req = { query: {} };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getAllEvents(req, res);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      res.data.data.forEach(event => {
        const eventDate = new Date(event.date);
        expect(eventDate >= today).to.be.true;
      });
    });
  });

  describe('getEventById', () => {
    it('should return event if found', () => {
      const req = { params: { id: '1' } };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getEventById(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.data.success).to.be.true;
      expect(res.data.data).to.be.an('object');
      expect(res.data.data.id).to.equal(1);
    });

    it('should return 404 if event not found', () => {
      const req = { params: { id: '99999' } };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getEventById(req, res);

      expect(res.statusCode).to.equal(404);
      expect(res.data.success).to.be.false;
      expect(res.data.error).to.equal('Event not found');
    });
  });

  describe('createEvent', () => {
    it('should create a new event with valid data', () => {
      const req = {
        body: {
          title: 'Test Event',
          date: '2025-12-01',
          time: '6:00 PM',
          location: 'Kimmel Center',
          description: 'This is a test event',
          category: ['Tech', 'Social']
        }
      };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      const initialLength = mockEvents.length;
      createEvent(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data.success).to.be.true;
      expect(res.data.data).to.be.an('object');
      expect(res.data.data.title).to.equal('Test Event');
      expect(mockEvents.length).to.equal(initialLength + 1);
    });

    it('should return 400 if required fields are missing', () => {
      const req = {
        body: {
          title: 'Test Event'
          // Missing other required fields
        }
      };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      createEvent(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.data.success).to.be.false;
    });

    it('should return 400 if no categories provided', () => {
      const req = {
        body: {
          title: 'Test Event',
          date: '2025-12-01',
          time: '6:00 PM',
          location: 'Kimmel Center',
          description: 'This is a test event',
          category: []
        }
      };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      createEvent(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.data.success).to.be.false;
      expect(res.data.error).to.include('category');
    });
  });

  describe('getNextEventId', () => {
    it('should return a valid next ID', () => {
      const nextId = getNextEventId();
      expect(nextId).to.be.a('number');
      expect(nextId).to.be.greaterThan(0);
    });
  });
});

