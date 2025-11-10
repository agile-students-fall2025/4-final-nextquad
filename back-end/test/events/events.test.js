const { expect } = require('chai');
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../../controllers/events/eventsController');

describe('Events Controller', () => {
  describe('getAllEvents', () => {
    it('should return all upcoming events by default', (done) => {
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
      getAllEvents(req, res);
    });

    it('should filter events by category', (done) => {
      const req = {
        query: { category: 'Music' }
      };
      const res = {
        status: (code) => {
          return {
            json: (data) => {
              expect(data.success).to.be.true;
              data.data.forEach(event => {
                expect(event.category).to.include('Music');
              });
              done();
            }
          };
        }
      };
      getAllEvents(req, res);
    });

    it('should search events by title', (done) => {
      const req = {
        query: { search: 'Concert' }
      };
      const res = {
        status: (code) => {
          return {
            json: (data) => {
              expect(data.success).to.be.true;
              done();
            }
          };
        }
      };
      getAllEvents(req, res);
    });

    it('should sort events by latest', (done) => {
      const req = {
        query: { sort: 'latest' }
      };
      const res = {
        status: (code) => {
          return {
            json: (data) => {
              expect(data.success).to.be.true;
              if (data.data.length > 1) {
                const firstDate = new Date(data.data[0].date);
                const secondDate = new Date(data.data[1].date);
                expect(firstDate >= secondDate).to.be.true;
              }
              done();
            }
          };
        }
      };
      getAllEvents(req, res);
    });

    it('should include past events when requested', (done) => {
      const req = {
        query: { showPast: 'true' }
      };
      const res = {
        status: (code) => {
          return {
            json: (data) => {
              expect(data.success).to.be.true;
              expect(data.count).to.be.at.least(1);
              done();
            }
          };
        }
      };
      getAllEvents(req, res);
    });
  });

  describe('getEventById', () => {
    it('should return event when valid ID is provided', (done) => {
      const req = {
        params: { id: '1' }
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return {
            json: (data) => {
              expect(data.success).to.be.true;
              expect(data.data).to.have.property('id');
              expect(data.data).to.have.property('title');
              expect(data.data).to.have.property('date');
              done();
            }
          };
        }
      };
      getEventById(req, res);
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
      getEventById(req, res);
    });
  });

  describe('createEvent', () => {
    it('should create event with valid data', (done) => {
      const req = {
        body: {
          title: 'Test Event',
          date: '2025-12-01',
          time: '7:00 PM',
          location: 'Test Location',
          description: 'Test Description',
          category: ['Social']
        }
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(201);
          return {
            json: (data) => {
              expect(data.success).to.be.true;
              expect(data.data.title).to.equal('Test Event');
              expect(data.data.date).to.equal('2025-12-01');
              expect(data.data.time).to.equal('7:00 PM');
              done();
            }
          };
        }
      };
      createEvent(req, res);
    });

    it('should return 400 when missing required fields', (done) => {
      const req = {
        body: {
          title: 'Test Event'
        }
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(400);
          return {
            json: (data) => {
              expect(data.success).to.be.false;
              expect(data.error).to.include('required fields');
              done();
            }
          };
        }
      };
      createEvent(req, res);
    });

    it('should return 400 when category is empty', (done) => {
      const req = {
        body: {
          title: 'Test Event',
          date: '2025-12-01',
          time: '7:00 PM',
          location: 'Test Location',
          description: 'Test Description',
          category: []
        }
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(400);
          return {
            json: (data) => {
              expect(data.success).to.be.false;
              expect(data.error).to.include('category');
              done();
            }
          };
        }
      };
      createEvent(req, res);
    });
  });

  describe('updateEvent', () => {
    it('should update event when host makes request', (done) => {
      const req = {
        params: { id: '1' },
        body: {
          title: 'Updated Title',
          description: 'Updated Description'
        }
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return {
            json: (data) => {
              expect(data.success).to.be.true;
              expect(data.data.title).to.equal('Updated Title');
              done();
            }
          };
        }
      };
      updateEvent(req, res);
    });

    it('should return 404 when event not found', (done) => {
      const req = {
        params: { id: '99999' },
        body: { title: 'Updated' }
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
      updateEvent(req, res);
    });
  });

  describe('deleteEvent', () => {
    it('should delete event when host makes request', (done) => {
      // First create an event
      const createReq = {
        body: {
          title: 'Event to Delete',
          date: '2025-12-01',
          time: '7:00 PM',
          location: 'Test',
          description: 'Test',
          category: ['Social']
        }
      };
      let eventId;
      const createRes = {
        status: () => ({
          json: (data) => {
            eventId = data.data.id;
          }
        })
      };
      createEvent(createReq, createRes);

      // Then delete it
      const deleteReq = {
        params: { id: eventId.toString() }
      };
      const deleteRes = {
        status: (code) => {
          expect(code).to.equal(200);
          return {
            json: (data) => {
              expect(data.success).to.be.true;
              expect(data.message).to.include('deleted');
              done();
            }
          };
        }
      };
      deleteEvent(deleteReq, deleteRes);
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
      deleteEvent(req, res);
    });
  });
});

