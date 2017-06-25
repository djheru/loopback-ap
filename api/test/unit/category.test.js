'use strict';

const {app, expect} = require('../common');
const {Category, Product} = app.models;

describe('Category', () => {
  describe('Hooks', () => {
    it('should not delete a category with products', () => {
      const expectedError = 'Error deleting category with existing products';
      return Promise.resolve()
        .then(() => Category.create({name: 'Foo Category'}))
        .then(cat => Product.create({
          name: 'Foo Product',
          price: 200,
          categoryId: cat.id,
        }))
        .then(prod => Category.destroyById(prod.categoryId))
        .then(res => expect(res).to.equal(null))
        .catch(err => expect(err).to.equal(expectedError));
    });
  });
});
