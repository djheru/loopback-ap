'use strict';

const {app, expect, request} = require('../common');

describe('ACL', () => {
  describe('Category', () => {
    it('should return status 200 when listing Categories', () => {
      return request
        .get('/api/Categories')
        .expect(200);
    });
    it('should return status 401 when listing Categories', () => {
      return request
        .post('/api/Categories')
        .send({name: 'Some category'})
        .expect(401);
    });
    it('should return status 401 when listing Categories', () => {
      return request
        .patch('/api/Categories/1')
        .send({name: 'Some category'})
        .expect(401);
    });
    it('should return status 401 when listing Categories', () => {
      return request
        .delete('/api/Categories/1')
        .expect(401);
    });
  });

  describe('Product', () => {
    it('should return status 200 when listing Products', () => {
      return request
        .get('/api/Products')
        .expect(200);
    });
    it('should return status 200 when calling buy()', () => {
      return app.models.Product.create({name: 'test', price: 100})
        .then(res => request
          .post(`/api/Products/${res.id}/buy`)
          .send({quantity: 100})
          .expect(200));
    });
    it('should return status 401 when listing Products', () => {
      return request
        .post('/api/Products')
        .send({name: 'Some category'})
        .expect(401);
    });
    it('should return status 401 when listing Products', () => {
      return request
        .patch('/api/Products/1')
        .send({name: 'Some category'})
        .expect(401);
    });
    it('should return status 401 when listing Products', () => {
      return request
        .delete('/api/Products/1')
        .expect(401);
    });
  });
});
