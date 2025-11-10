const { expect } = require('chai');
const { getEventAnalytics, checkInToEvent } = require('../../controllers/events/analyticsController');

describe('Analytics Controller', () => {
  describe('getEventAnalytics', () => {
    it('should return analytics data for an existing event', (done) => {
      const req = {
        params: { id: '1' }
      };

      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return {
            json: (data) => {
              expect(data.success).to.be.true;
              expect(data.data).to.have.property('event');
              expect(data.data).to.have.property('metrics');
              expect(data.data).to.have.property('rsvpTimeline');
              expect(data.data).to.have.property('insights');
              expect(data.data).to.have.property('surveys');
              
              // Check metrics structure
              expect(data.data.metrics).to.have.property('totalRSVPs');
              expect(data.data.metrics).to.have.property('totalCheckIns');
              expect(data.data.metrics).to.have.property('checkInRate');
              expect(data.data.metrics).to.have.property('averageRating');
              expect(data.data.metrics).to.have.property('totalSurveys');
              
              // Check rsvpTimeline is array
              expect(data.data.rsvpTimeline).to.be.an('array');
              
              // Check insights is array
              expect(data.data.insights).to.be.an('array');
              
              done();
            }
          };
        }
      };

      getEventAnalytics(req, res);
    });

    it('should return 404 if event does not exist', (done) => {
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

      getEventAnalytics(req, res);
    });
  });

  describe('checkInToEvent', () => {
    it('should successfully check in to an event with RSVP', (done) => {
      const req = {
        params: { id: '2' }
      };

      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return {
            json: (data) => {
              expect(data.success).to.be.true;
              expect(data.message).to.include('Check-in successful');
              expect(data.data).to.have.property('eventId');
              expect(data.data).to.have.property('userId');
              expect(data.data).to.have.property('checkedInAt');
              done();
            }
          };
        }
      };

      checkInToEvent(req, res);
    });

    it('should return 404 if event does not exist', (done) => {
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

      checkInToEvent(req, res);
    });

    it('should return 403 if user has not RSVP\'d', (done) => {
      const req = {
        params: { id: '1' }
      };

      const res = {
        status: (code) => {
          expect(code).to.equal(403);
          return {
            json: (data) => {
              expect(data.success).to.be.false;
              expect(data.error).to.include('RSVP');
              done();
            }
          };
        }
      };

      checkInToEvent(req, res);
    });

    it('should return 400 if user has already checked in', (done) => {
      // First check-in
      const req1 = {
        params: { id: '3' }
      };

      const res1 = {
        status: (code) => {
          return {
            json: (data) => {
              // Try to check in again
              const req2 = {
                params: { id: '3' }
              };

              const res2 = {
                status: (code) => {
                  expect(code).to.equal(400);
                  return {
                    json: (data) => {
                      expect(data.success).to.be.false;
                      expect(data.error).to.include('already checked in');
                      done();
                    }
                  };
                }
              };

              checkInToEvent(req2, res2);
            }
          };
        }
      };

      checkInToEvent(req1, res1);
    });
  });
});
