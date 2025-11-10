const { expect } = require('chai');
const {
  rsvpToEvent,
  cancelRSVP,
  getEventRSVPs,
  checkRSVPStatus
} = require('../../controllers/events/rsvpController');
const { mockEvents } = require('../../data/events/mockEvents');

describe('RSVP Controller', () => {
  // Ensure test events have future dates
  before(() => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
    const futureDateString = futureDate.toISOString().split('T')[0];
    
    // Set event 1 (user's hosted event) to future date
    if (mockEvents.length > 0) {
      mockEvents[0].date = futureDateString;
    }
    // Set event 4 (for RSVP test) to future date
    if (mockEvents.length > 3) {
      mockEvents[3].date = futureDateString;
    }
  });

  describe('rsvpToEvent', () => {
    it('should successfully RSVP to an event', (done) => {
      const req = {
        params: { id: '4' }  // Event 4 - user is not host and hasn't RSVP'd
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return {
            json: (data) => {
              expect(data.success).to.be.true;
              expect(data.message).to.include('RSVP successful');
              expect(data.data.eventId).to.equal(4);
              done();
            }
          };
        }
      };
      rsvpToEvent(req, res);
    });

    it('should return 404 when event not found', (done) => {
      const req = {
        params: { id: '99999' }
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(404);
          return {
            json: (data) => {
              expect(data.success).to.be.false;
              expect(data.error).to.include('not found');
              done();
            }
          };
        }
      };
      rsvpToEvent(req, res);
    });

    it('should return 400 when already RSVP\'d', (done) => {
      const req = {
        params: { id: '2' } // User already RSVP'd to event 2
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(400);
          return {
            json: (data) => {
              expect(data.success).to.be.false;
              expect(data.error).to.include('already');
              done();
            }
          };
        }
      };
      rsvpToEvent(req, res);
    });

    it('should return 400 when hosting the event', (done) => {
      const req = {
        params: { id: '1' } // User hosts event 1
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(400);
          return {
            json: (data) => {
              expect(data.success).to.be.false;
              expect(data.error).to.include('host');
              done();
            }
          };
        }
      };
      rsvpToEvent(req, res);
    });
  });

  describe('cancelRSVP', () => {
    it('should cancel RSVP successfully', (done) => {
      const req = {
        params: { id: '2' } // User has RSVP'd to event 2
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return {
            json: (data) => {
              expect(data.success).to.be.true;
              expect(data.message).to.include('cancelled');
              done();
            }
          };
        }
      };
      cancelRSVP(req, res);
    });

    it('should return 404 when event not found', (done) => {
      const req = {
        params: { id: '99999' }
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(404);
          return {
            json: (data) => {
              expect(data.success).to.be.false;
              done();
            }
          };
        }
      };
      cancelRSVP(req, res);
    });

    it('should return 400 when not RSVP\'d', (done) => {
      const req = {
        params: { id: '5' } // User has not RSVP'd to event 5
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(400);
          return {
            json: (data) => {
              expect(data.success).to.be.false;
              expect(data.error).to.include('not RSVP');
              done();
            }
          };
        }
      };
      cancelRSVP(req, res);
    });
  });

  describe('getEventRSVPs', () => {
    it('should return RSVP list for event host', (done) => {
      const req = {
        params: { id: '1' } // User hosts event 1
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return {
            json: (data) => {
              expect(data.success).to.be.true;
              expect(data.count).to.be.a('number');
              expect(data.data).to.be.an('array');
              done();
            }
          };
        }
      };
      getEventRSVPs(req, res);
    });

    it('should return 404 when event not found', (done) => {
      const req = {
        params: { id: '99999' }
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(404);
          return {
            json: (data) => {
              expect(data.success).to.be.false;
              done();
            }
          };
        }
      };
      getEventRSVPs(req, res);
    });

    it('should return 403 when not event host', (done) => {
      const req = {
        params: { id: '3' } // User is not host of event 3
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(403);
          return {
            json: (data) => {
              expect(data.success).to.be.false;
              expect(data.error).to.include('host');
              done();
            }
          };
        }
      };
      getEventRSVPs(req, res);
    });
  });

  describe('checkRSVPStatus', () => {
    it('should return RSVP status for user', (done) => {
      const req = {
        params: { id: '4' }  // Event 4 - to match RSVP test
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return {
            json: (data) => {
              expect(data.success).to.be.true;
              expect(data.data).to.have.property('hasRSVPd');
              expect(data.data).to.have.property('isHost');
              expect(data.data).to.have.property('canRSVP');
              // After RSVPing in previous test, user should have RSVP'd
              expect(data.data.hasRSVPd).to.be.true;
              done();
            }
          };
        }
      };
      checkRSVPStatus(req, res);
    });

    it('should indicate when user is host', (done) => {
      const req = {
        params: { id: '1' }
      };
      const res = {
        status: (code) => {
          return {
            json: (data) => {
              expect(data.data.isHost).to.be.true;
              expect(data.data.canRSVP).to.be.false;
              done();
            }
          };
        }
      };
      checkRSVPStatus(req, res);
    });

    it('should return 404 when event not found', (done) => {
      const req = {
        params: { id: '99999' }
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(404);
          return {
            json: (data) => {
              expect(data.success).to.be.false;
              done();
            }
          };
        }
      };
      checkRSVPStatus(req, res);
    });
  });
});

