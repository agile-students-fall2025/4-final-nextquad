const { expect } = require('chai');
const { submitSurvey, getEventSurveys, getSurveysForAnalytics } = require('../../controllers/events/surveyController');

describe('Survey Controller', () => {
  describe('submitSurvey', () => {
    it('should successfully submit a survey with valid data', (done) => {
      const req = {
        params: { id: '100' },
        body: {
          rating: 5,
          enjoyedAspects: ['Networking', 'Food'],
          feedback: 'Great event!'
        }
      };

      const res = {
        status: (code) => {
          expect(code).to.equal(201);
          return {
            json: (data) => {
              expect(data.success).to.be.true;
              expect(data.data.rating).to.equal(5);
              expect(data.data.enjoyedAspects).to.deep.equal(['Networking', 'Food']);
              expect(data.data.feedback).to.equal('Great event!');
              done();
            }
          };
        }
      };

      submitSurvey(req, res);
    });

    it('should return 400 if rating is missing', (done) => {
      const req = {
        params: { id: '100' },
        body: {
          enjoyedAspects: ['Food'],
          feedback: 'Good'
        }
      };

      const res = {
        status: (code) => {
          expect(code).to.equal(400);
          return {
            json: (data) => {
              expect(data.success).to.be.false;
              expect(data.error).to.include('rating');
              done();
            }
          };
        }
      };

      submitSurvey(req, res);
    });

    it('should return 400 if rating is out of range', (done) => {
      const req = {
        params: { id: '100' },
        body: {
          rating: 6,
          enjoyedAspects: [],
          feedback: ''
        }
      };

      const res = {
        status: (code) => {
          expect(code).to.equal(400);
          return {
            json: (data) => {
              expect(data.success).to.be.false;
              expect(data.error).to.include('rating');
              done();
            }
          };
        }
      };

      submitSurvey(req, res);
    });

    it('should return 404 if event does not exist', (done) => {
      const req = {
        params: { id: '99999' },
        body: {
          rating: 5,
          enjoyedAspects: [],
          feedback: 'Test'
        }
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

      submitSurvey(req, res);
    });

    it('should return 400 if user has already submitted a survey', (done) => {
      // First submission
      const req1 = {
        params: { id: '100' },
        body: {
          rating: 5,
          enjoyedAspects: ['Content'],
          feedback: 'Great event!'
        }
      };

      const res1 = {
        status: (code) => {
          return {
            json: (data) => {
              // Now try to submit again
              const req2 = {
                params: { id: '100' },
                body: {
                  rating: 4,
                  enjoyedAspects: ['Networking'],
                  feedback: 'Second submission'
                }
              };

              const res2 = {
                status: (code) => {
                  expect(code).to.equal(400);
                  return {
                    json: (data) => {
                      expect(data.success).to.be.false;
                      expect(data.error).to.include('already submitted');
                      done();
                    }
                  };
                }
              };

              submitSurvey(req2, res2);
            }
          };
        }
      };

      submitSurvey(req1, res1);
    });
  });

  describe('getEventSurveys', () => {
    it('should return surveys for event host', (done) => {
      // First submit a survey
      const submitReq = {
        params: { id: '1' },
        body: {
          rating: 4,
          enjoyedAspects: ['Venue'],
          feedback: 'Nice place'
        }
      };

      const submitRes = {
        status: () => ({
          json: () => {}
        })
      };

      submitSurvey(submitReq, submitRes);

      // Then get surveys
      const req = {
        params: { id: '1' }
      };

      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return {
            json: (data) => {
              expect(data.success).to.be.true;
              expect(data.count).to.be.at.least(1);
              expect(data.averageRating).to.be.a('string');
              expect(data.data).to.be.an('array');
              done();
            }
          };
        }
      };

      getEventSurveys(req, res);
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
              done();
            }
          };
        }
      };

      getEventSurveys(req, res);
    });
  });

  describe('getSurveysForAnalytics', () => {
    it('should return surveys for a given event', () => {
      const surveys = getSurveysForAnalytics(1);
      expect(surveys).to.be.an('array');
    });

    it('should return empty array for event with no surveys', () => {
      const surveys = getSurveysForAnalytics(99999);
      expect(surveys).to.be.an('array');
      expect(surveys).to.have.lengthOf(0);
    });
  });
});

