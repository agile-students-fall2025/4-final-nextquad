const { expect } = require('chai');
const {
  getPoints,
  getPointById,
  searchPoints
} = require('../../controllers/campus_map/mapPinsController');

describe('Map Pins Controller', () => {
  describe('getPoints', () => {
    it('should return all pins with envelope by default', (done) => {
      const req = {
        query: {}
      };

      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return {
            json: (data) => {
              try {
                expect(data).to.be.an('object');
                expect(data.success).to.be.true;
                expect(data).to.have.property('count');
                expect(data).to.have.property('data');
                expect(data.data).to.be.an('array');

                if (data.data.length > 0) {
                  const pin = data.data[0];
                  expect(pin).to.have.property('id');
                  expect(pin).to.have.property('x');
                  expect(pin).to.have.property('y');
                  expect(pin).to.have.property('title');
                  expect(pin).to.have.property('categories');
                }
                done();
              } catch (err) {
                done(err);
              }
            }
          };
        }
      };

      getPoints(req, res);
    });

    it('should filter pins by categories', (done) => {
      const req = {
        query: { categories: 'study,printer' }
      };

      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return {
            json: (data) => {
              try {
                expect(data.success).to.be.true;
                expect(data.data).to.be.an('array');

                data.data.forEach((pin) => {
                  const cats = new Set(pin.categories || []);
                  expect(cats.has('study') || cats.has('printer')).to.be.true;
                });

                done();
              } catch (err) {
                done(err);
              }
            }
          };
        }
      };

      getPoints(req, res);
    });

    it('should apply bbox filter when bbox is provided', (done) => {
      const req = {
        query: { bbox: '10,20,90,80' }
      };

      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return {
            json: (data) => {
              try {
                expect(data.success).to.be.true;
                expect(data.data).to.be.an('array');

                data.data.forEach((pin) => {
                  expect(pin.x).to.be.at.least(10);
                  expect(pin.x).to.be.at.most(90);
                  expect(pin.y).to.be.at.least(20);
                  expect(pin.y).to.be.at.most(80);
                });

                done();
              } catch (err) {
                done(err);
              }
            }
          };
        }
      };

      getPoints(req, res);
    });

    it('should support search via search query param', (done) => {
      const req = {
        query: { search: 'library' }
      };

      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return {
            json: (data) => {
              try {
                expect(data.success).to.be.true;
                expect(data.data).to.be.an('array');
                done();
              } catch (err) {
                done(err);
              }
            }
          };
        }
      };

      getPoints(req, res);
    });
  });

  describe('getPointById', () => {
    it('should return a single pin when id exists', (done) => {
      const req = {
        params: { id: '1' } 
      };

      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return {
            json: (data) => {
              try {
                expect(data.success).to.be.true;
                expect(data.data).to.have.property('id', '1');
                done();
              } catch (err) {
                done(err);
              }
            }
          };
        }
      };

      getPointById(req, res);
    });

    it('should return 404 when pin is not found', (done) => {
      const req = {
        params: { id: '99999' }
      };

      const res = {
        status: (code) => {
          expect(code).to.equal(404);
          return {
            json: (data) => {
              try {
                expect(data.success).to.be.false;
                expect(data.error).to.match(/not found/i);
                done();
              } catch (err) {
                done(err);
              }
            }
          };
        }
      };

      getPointById(req, res);
    });
  });

  describe('searchPoints', () => {
    it('should return ranked results for a query', (done) => {
      const req = {
        query: { q: 'kimmel' }
      };

      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return {
            json: (data) => {
              try {
                expect(data.success).to.be.true;
                expect(data).to.have.property('count');
                expect(data.data).to.be.an('array');
                done();
              } catch (err) {
                done(err);
              }
            }
          };
        }
      };

      searchPoints(req, res);
    });

    it('should return empty list when query is empty', (done) => {
      const req = {
        query: { q: '' }
      };

      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return {
            json: (data) => {
              try {
                expect(data.success).to.be.true;
                expect(data.count).to.equal(0);
                expect(data.data).to.be.an('array').that.is.empty;
                done();
              } catch (err) {
                done(err);
              }
            }
          };
        }
      };

      searchPoints(req, res);
    });
  });
});
