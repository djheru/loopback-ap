'use strict';

const {app, expect} = require('../common');

// Get the reference to the model through the app
const Product = app.models.Product;

describe('(model) Product', () => {
  it('should have a find() method', () => {
    return Product.find()
      .then(res => {
        expect(res).to.be.an('array');
      });
  });

  it('should allow creating a product', () => {
    return Product.create({name: 'realprod', price: 299})
      .then(res => {
        expect(res.name).to.equal('realprod');
        expect(res.price).to.equal(299);
      });
  });

  describe('Remote Methods', () => {
    // buy
    it('should allow buying a product', () => {
      const product = new Product({name: 'somefoo', price: 299});
      const quantity = 10;
      return product.buy(quantity, (err, res) => {
        expect(res.status).to.contain(`You bought ${quantity} product(s)`);
      });
    });

    // validateQuantity
    it('should not allow buying a negative quantity', () => {
      const product = new Product({name: 'somefoo', price: 299});
      const quantity = -10;
      return product.buy(quantity, (err, res) => {
        expect(err).to.contain(`Invalid quantity: ${quantity}`);
      });
    });
  });

  describe('Validation', () => {
    // validatesLengthOf
    it('should reject a name with < 3 characters', () => {
      return Product.create({name: 'aa', price: 200})
        .then(res => Promise.reject('Product should not be created'))
        .catch(err => {
          expect(err.message).to.contain('Name must be at least 3 characters');
          expect(err.statusCode).to.equal(422);
        });
    });
    // validatesUniquenessOf
    it('should reject a name that already exists', () => {
      return Promise.resolve()
        .then(() => Product.create({name: 'aaa', price: 200}))
        .then(() => Product.create({name: 'aaa', price: 200}))
        .then(res => Promise.reject('Second product should not be created'))
        .catch(err => {
          expect(err.message).to.contain('`name` is not unique');
          expect(err.statusCode).to.equal(422);
        });
    });
  });

  describe('Async Validation', () => {
    // validateMinimalPrice
    it('should reject a price < 99', () => {
      const expectedError =
        'Price must be higher than the minimal price in the database';
      return Product.create({name: 'abc', price: 98})
        .then(res => Promise.reject('Product should not be created'))
        .catch(err => {
          expect(err.message).to.contain(expectedError);
          expect(err.statusCode).to.equal(422);
        });
    });
  });

  describe('Custom Validation', () => {
    // validatePositiveInteger
    it('should reject a price < 0', () => {
      return Product.create({name: 'aaa', price: -1})
        .then(res => Promise.reject('Product should not be created'))
        .catch(err => {
          expect(err.message).to.contain('Price should be a positive integer');
          expect(err.statusCode).to.equal(422);
        });
    });
  });

  describe('Hooks', () => {
    // before save hook
    it('should reject a non-existent category', () => {
      return Product.create({name: 'abcd', price: 100, categoryId: 9999})
        .then(res => expect(res).to.equal(null))
        .catch(err => expect(err)
          .to.equal('Error adding product to non-existing category'));
    });
  });
});
