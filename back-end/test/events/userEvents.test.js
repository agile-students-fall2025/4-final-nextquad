const { expect } = require('chai');
const {
  getUserRSVPedEvents,
  getUserHostedEvents,
  getEventsNeedingAttention,
  getUserPastEvents
} = require('../../controllers/events/userEventsController');

describe('User Events Controller', () => {
  describe('getUserRSVPedEvents', () => {
    it('should return events user has RSVP\'d to', (done) => {
      const req = {
        query: {}
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
      getUserRSVPedEvents(req, res);
    });

    it('should include upcoming events only by default', (done) => {
      const req = {
        query: {}
      };
      const res = {
        status: (code) => {
          return {
            json: (data) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              data.data.forEach(event => {
                const eventDate = new Date(event.date);
                expect(eventDate >= today).to.be.true;
              });
              done();
            }
          };
        }
      };
      getUserRSVPedEvents(req, res);
    });
  });

  describe('getUserHostedEvents', () => {
    it('should return events user is hosting', (done) => {
      const req = {
        query: {}
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return {
            json: (data) => {
              expect(data.success).to.be.true;
              expect(data.count).to.be.a('number');
              expect(data.data).to.be.an('array');
              data.data.forEach(event => {
                expect(event.host.userId).to.equal('user123');
              });
              done();
            }
          };
        }
      };
      getUserHostedEvents(req, res);
    });
  });

  describe('getEventsNeedingAttention', () => {
    it('should return events needing check-in or survey', (done) => {
      const req = {};
      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return {
            json: (data) => {
              expect(data.success).to.be.true;
              expect(data).to.have.property('needsCheckIn');
              expect(data).to.have.property('needsSurvey');
              expect(data.needsCheckIn).to.be.an('array');
              expect(data.needsSurvey).to.be.an('array');
              done();
            }
          };
        }
      };
      getEventsNeedingAttention(req, res);
    });

    it('should identify events within 24 hours for check-in', (done) => {
      const req = {};
      const res = {
        status: (code) => {
          return {
            json: (data) => {
              data.needsCheckIn.forEach(event => {
                const eventDate = new Date(event.date);
                const now = new Date();
                const hoursDiff = (eventDate - now) / (1000 * 60 * 60);
                expect(hoursDiff).to.be.at.most(24);
              });
              done();
            }
          };
        }
      };
      getEventsNeedingAttention(req, res);
    });

    it('should identify past events needing survey', (done) => {
      const req = {};
      const res = {
        status: (code) => {
          return {
            json: (data) => {
              data.needsSurvey.forEach(event => {
                expect(event.isPast).to.be.true;
              });
              done();
            }
          };
        }
      };
      getEventsNeedingAttention(req, res);
    });
  });

  describe('getUserPastEvents', () => {
    it('should return only past events user attended', (done) => {
      const req = {
        query: {}
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return {
            json: (data) => {
              expect(data.success).to.be.true;
              expect(data.count).to.be.a('number');
              expect(data.data).to.be.an('array');
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              data.data.forEach(event => {
                const eventDate = new Date(event.date);
                expect(eventDate < today).to.be.true;
              });
              done();
            }
          };
        }
      };
      getUserPastEvents(req, res);
    });
  });
});

