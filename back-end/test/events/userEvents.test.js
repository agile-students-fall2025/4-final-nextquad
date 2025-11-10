const { expect } = require('chai');
const { mockEvents, mockRSVPs } = require('../../data/events/mockEvents');
const {
  getUserRSVPedEvents,
  getUserHostedEvents,
  getEventsNeedingAttention,
  getUserPastEvents
} = require('../../controllers/events/userEventsController');

describe('User Events Controller', () => {

  describe('getUserRSVPedEvents', () => {
    it('should return events user has RSVP\'d to', () => {
      const req = {};
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getUserRSVPedEvents(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.data.success).to.be.true;
      expect(res.data.data).to.be.an('array');
      expect(res.data.count).to.be.a('number');
    });

    it('should only return upcoming events', () => {
      const req = {};
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getUserRSVPedEvents(req, res);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      res.data.data.forEach(event => {
        const eventDate = new Date(event.date);
        expect(eventDate >= today).to.be.true;
      });
    });

    it('should return events sorted by date', () => {
      const req = {};
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getUserRSVPedEvents(req, res);

      const events = res.data.data;
      for (let i = 0; i < events.length - 1; i++) {
        const date1 = new Date(events[i].date);
        const date2 = new Date(events[i + 1].date);
        expect(date1 <= date2).to.be.true;
      }
    });
  });

  describe('getUserHostedEvents', () => {
    it('should return events user is hosting', () => {
      const req = {};
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getUserHostedEvents(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.data.success).to.be.true;
      expect(res.data.data).to.be.an('array');
      
      // All returned events should have the mock user as host
      res.data.data.forEach(event => {
        expect(event.host.userId).to.equal('user123');
      });
    });

    it('should only return upcoming hosted events', () => {
      const req = {};
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getUserHostedEvents(req, res);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      res.data.data.forEach(event => {
        const eventDate = new Date(event.date);
        expect(eventDate >= today).to.be.true;
      });
    });
  });

  describe('getEventsNeedingAttention', () => {
    it('should return events needing user attention', () => {
      const req = {};
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getEventsNeedingAttention(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.data.success).to.be.true;
      expect(res.data.data).to.be.an('array');
    });

    it('should include needsCheckIn or needsSurvey flags', () => {
      const req = {};
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getEventsNeedingAttention(req, res);

      res.data.data.forEach(event => {
        const hasFlag = event.needsCheckIn || event.needsSurvey;
        expect(hasFlag).to.be.true;
      });
    });

    it('should only include events user RSVP\'d to', () => {
      const req = {};
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getEventsNeedingAttention(req, res);

      // Check that all returned events are in mockRSVPs for user123
      res.data.data.forEach(event => {
        const hasRSVP = mockRSVPs[event.id] && mockRSVPs[event.id].includes('user123');
        expect(hasRSVP).to.be.true;
      });
    });
  });

  describe('getUserPastEvents', () => {
    it('should return user\'s past events', () => {
      const req = {};
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getUserPastEvents(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.data.success).to.be.true;
      expect(res.data.data).to.be.an('array');
    });

    it('should only return past events', () => {
      const req = {};
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getUserPastEvents(req, res);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      res.data.data.forEach(event => {
        const eventDate = new Date(event.date);
        expect(eventDate < today).to.be.true;
      });
    });

    it('should return events sorted by date (most recent first)', () => {
      const req = {};
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getUserPastEvents(req, res);

      const events = res.data.data;
      for (let i = 0; i < events.length - 1; i++) {
        const date1 = new Date(events[i].date);
        const date2 = new Date(events[i + 1].date);
        expect(date1 >= date2).to.be.true;
      }
    });
  });
});

