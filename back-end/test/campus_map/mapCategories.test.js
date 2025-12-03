const { expect } = require('chai');
const { getCategories } = require('../../controllers/campus_map/mapCategoriesController');

describe('Map Categories Controller', () => {
  describe('getCategories', () => {
    it('should return all map categories', async () => {
      const req = {};

      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return {
            json: (data) => {
              expect(data).to.be.an('object');
              expect(data.success).to.be.true;
              expect(data).to.have.property('count');
              expect(data).to.have.property('data');
              expect(data.data).to.be.an('array');

              if (data.data.length > 0) {
                const first = data.data[0];
                expect(first).to.have.property('id');
                expect(first).to.have.property('label');
              }
              return data;
            }
          };
        }
      };

      await getCategories(req, res);
    });
  });
});
