const { expect } = require('chai');
const { mockEvents, mockRSVPs } = require('../../data/events/mockEvents');
const {
  rsvpToEvent,
  cancelRSVP,
  getEventRSVPs,
  checkRSVPStatus
} = require('../../controllers/events/rsvpController');

describe('RSVP Controller', () => {

  describe('rsvpToEvent', () => {
    it('should successfully RSVP to an event', () => {
      // Find an event that exists and user hasn't RSVP'd to
      const testEvent = mockEvents.find(e => {
        const notHosted = e.host.userId !== 'user123';
        const notRSVPd = !mockRSVPs[e.id] || !mockRSVPs[e.id].includes('user123');
        const isUpcoming = new Date(e.date) >= new Date();
        return notHosted && notRSVPd && isUpcoming;
      });

      if (!testEvent) {
        console.log('No suitable event found for RSVP test');
        return;
      }

      const req = { params: { id: testEvent.id.toString() } };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      const initialRSVPCount = testEvent.rsvpCount;
      rsvpToEvent(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.data.success).to.be.true;
      expect(res.data.message).to.include('Successfully');
      expect(mockRSVPs[testEvent.id]).to.include('user123');
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

      rsvpToEvent(req, res);

      expect(res.statusCode).to.equal(404);
      expect(res.data.success).to.be.false;
      expect(res.data.error).to.equal('Event not found');
    });

    it('should return 400 if user tries to RSVP to their own event', () => {
      // Find an event hosted by user123
      const hostedEvent = mockEvents.find(e => e.host.userId === 'user123');
      
      if (!hostedEvent) {
        console.log('No hosted event found for test');
        return;
      }

      const req = { params: { id: hostedEvent.id.toString() } };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      rsvpToEvent(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.data.success).to.be.false;
      expect(res.data.error).to.include('own event');
    });

    it('should return 400 if user has already RSVP\'d', () => {
      // Find an event user has already RSVP'd to
      const rsvpdEvent = mockEvents.find(e => 
        mockRSVPs[e.id] && mockRSVPs[e.id].includes('user123')
      );

      if (!rsvpdEvent) {
        console.log('No RSVP\'d event found for test');
        return;
      }

      const req = { params: { id: rsvpdEvent.id.toString() } };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      rsvpToEvent(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.data.success).to.be.false;
      expect(res.data.error).to.include('already');
    });
  });

  describe('cancelRSVP', () => {
    it('should successfully cancel RSVP', () => {
      // Find an event user has RSVP'd to
      const rsvpdEvent = mockEvents.find(e => 
        mockRSVPs[e.id] && mockRSVPs[e.id].includes('user123')
      );

      if (!rsvpdEvent) {
        console.log('No RSVP\'d event found for cancel test');
        return;
      }

      const req = { params: { id: rsvpdEvent.id.toString() } };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      cancelRSVP(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.data.success).to.be.true;
      expect(res.data.message).to.include('cancelled');
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

      cancelRSVP(req, res);

      expect(res.statusCode).to.equal(404);
      expect(res.data.success).to.be.false;
    });

    it('should return 400 if user has not RSVP\'d', () => {
      // Find an event user hasn't RSVP'd to
      const notRsvpdEvent = mockEvents.find(e => 
        (!mockRSVPs[e.id] || !mockRSVPs[e.id].includes('user123')) && 
        e.host.userId !== 'user123'
      );

      if (!notRsvpdEvent) {
        console.log('No non-RSVP\'d event found for test');
        return;
      }

      const req = { params: { id: notRsvpdEvent.id.toString() } };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      cancelRSVP(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.data.success).to.be.false;
      expect(res.data.error).to.include('not RSVP');
    });
  });

  describe('getEventRSVPs', () => {
    it('should return RSVPs for event host', () => {
      // Find an event hosted by user123
      const hostedEvent = mockEvents.find(e => e.host.userId === 'user123');

      if (!hostedEvent) {
        console.log('No hosted event found for test');
        return;
      }

      const req = { params: { id: hostedEvent.id.toString() } };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getEventRSVPs(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.data.success).to.be.true;
      expect(res.data.data).to.be.an('array');
      expect(res.data.count).to.be.a('number');
    });

    it('should return 403 if user is not the host', () => {
      // Find an event not hosted by user123
      const notHostedEvent = mockEvents.find(e => e.host.userId !== 'user123');

      if (!notHostedEvent) {
        console.log('No non-hosted event found for test');
        return;
      }

      const req = { params: { id: notHostedEvent.id.toString() } };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getEventRSVPs(req, res);

      expect(res.statusCode).to.equal(403);
      expect(res.data.success).to.be.false;
      expect(res.data.error).to.include('host');
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

      getEventRSVPs(req, res);

      expect(res.statusCode).to.equal(404);
      expect(res.data.success).to.be.false;
    });
  });

  describe('checkRSVPStatus', () => {
    it('should return RSVP status for an event', () => {
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

      checkRSVPStatus(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.data.success).to.be.true;
      expect(res.data.data).to.have.property('hasRSVPd');
      expect(res.data.data).to.have.property('isHost');
      expect(res.data.data).to.have.property('canRSVP');
    });

    it('should indicate if user is host', () => {
      // Find an event hosted by user123
      const hostedEvent = mockEvents.find(e => e.host.userId === 'user123');

      if (!hostedEvent) {
        console.log('No hosted event found for test');
        return;
      }

      const req = { params: { id: hostedEvent.id.toString() } };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      checkRSVPStatus(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.data.data.isHost).to.be.true;
      expect(res.data.data.canRSVP).to.be.false;
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

      checkRSVPStatus(req, res);

      expect(res.statusCode).to.equal(404);
      expect(res.data.success).to.be.false;
    });
  });
});

