'use strict';

module.exports = function(Product) {
  /**
   * Return true if input is less than zero
   * @param {number} quantity Number to validate
   */
  const validQuantity = q => (q > 0);

  // custom validation function
  const validatePositiveInteger = function(err) {
    if (!/^[0-9]*$/.test(this.price)) {
      err();
    }
  };

  // invoking the custom validation function
  Product.validate(
    'price',
    validatePositiveInteger,
    {message: 'Price should be a positive integer'});

  /**
   * Buy it sucka
   * @param {number} quantity Is buy how many
   * @param {Function(Error, object)} callback
   */
  Product.prototype.buy = function(quantity, callback) {
    if (!validQuantity(quantity)) {
      return callback(`Invalid quantity: ${quantity}`);
    }
    const result = {status: `You bought ${quantity} product(s)`};
    // TODO
    callback(null, result);
  };

  // Validates "name" property length
  Product.validatesLengthOf(
    'name',
    {min: 3, message: {min: 'Name must be at least 3 characters'}});

  // Validates "name" property uniqueness
  Product.validatesUniquenessOf('name');

  // Async validation
  function validateMinimalPrice(err, done) {
    const price = this.price;
    process.nextTick(() => {
      const minimalPriceFromDB = 99;
      if (price < minimalPriceFromDB) {
        err();
      }
      done();
    });
  }

  // invoking the async validation
  const minimalPriceMsg =
    'Price must be higher than the minimal price in the database';
  Product.validateAsync(
    'price',
    validateMinimalPrice,
    {message: minimalPriceMsg});

  // Hooks
  Product.observe('before save', function(ctx, next) {
    // check to ensure that the category id is valid, if provided
    if (ctx.instance && ctx.instance.categoryId) {
      return Product.app.models.Category
        .count({id: ctx.instance.categoryId})
        .then(res => {
          if (res < 1) {
            return Promise
              .reject('Error adding product to non-existing category');
          }
        });
    }
    return next();
  });
};
