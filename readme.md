# Bootstrap REST API with Loopback

## 1. Initialize the project
```shell
npm install -g loopback-cli@2.0.0
mkdir loopback-api && cd $_
lb app
```
#### Interactive application generation
- Name of application
- Loopback version (2.x or 3.x)
- What kind of application (api-server, empty-server, hello world)
- Select the defaults

```shell
# Start command - node . or npm start
npm start

# navigate to localhost:3000 (api healthcheck) localhost:3000/explorer (api explorer)
# Note the built-in User model
```

## 2. Create a model

```shell
lb model
```
#### Interactive model generation
- Name of model (singular, PascalCase) "Product"
- Datasource (db <memory>, no datasource)
- Model base class (PersistedModel) - Gives CRUD
- Expose model via REST API?
- Custom plural form?
- Common model or server only?
- Enter properties
  - Property name "name, price"
  - Type "string, number"
  - Is required "y, y"
  - Default value
- Repeat and press enter again when done
- Look in ./server/model-config.json - See the models?
- Look in ./common/models/product.json - It a model definition
- Look in ./common/models/product.js - It the model class. You can add methods here 

## 3. Persist to a file
- The default datasource is in-memory
- Modify ./server/datasources.json and add a property "file" with value "db.json" under "db"
- Start the server and add an instance of the model using the "POST" method
- Look in db.json for the data you just did it

## 4. Setup dev mode with nodemon
- `npm i --save-dev nodemon`
- New run script in package.json: 
  - `"dev": "nodemon server/server.js --watch common --watch server"`
- Now the server will restart automatically

## 5. Relationships between models
```shell
lb model Category
```
- Answer questions as before

```shell
# Add a property to the Product model
lb property
# Add property categoryId, number, not required, no default

# create the relationship
# Category relation
lb relation
```
- Relationship from: Category
- Relationship type: has many (category has many products)
- Relationship with: Product
- Property name for relation: products
- Foreign Key: categoryId
- Through model: No
- Now define the relationship from the Product to Category

```shell
# Product relation
lb relation
```
- Relationship from: Product
- Relationship type: belongs to (product belongs to category)
- Relationship with: Category
- Property name for relation: category
- Foreign Key: categoryId

## 6. Remote methods on a model
```shell
lb remote-method
```
- Model: Product
- Method name: buy
- Is Static: no
- Description for Method: BUY IT SUCKA
- path: /buy
- HTTP verb: POST
- Enter input arguments
  - argument name: quantity
  - argument type: number
  - Is required: Yes
  - Description: Number to buy
  - Get value from: (auto)
- Enter output arguments
  - argument name: result
  - type: object
  - Full response body (root): yes
  - Description: result of the purchae
  - It adds the metadata to ./common/models/product.json
  - See the "methods" key has the new remote method
  - You implement the method in product.js
  - Example code is provided
```javascript
/**
 * Buy it sucka
 * @param {number} quantity Is buy how many
 * @param {Function(Error, object)} callback
 */

Product.prototype.buy = function(quantity, callback) {
  const result = { res: 'result goes here', quantity};
  // TODO
  callback(null, result);
};

```
- Implement the above code, run the server, and submit to the "/api/Products/1/buy" route
- Implement code that checks to ensure the quantity is greater than 0, otherwise return the
callback with an error message

## 7. Model validation
- Add validation by calling the static validation methods
  - https://loopback.io/doc/en/lb2/Validating-model-data.html
  - validatesAbsenceOf - Model must not include a given property. Fails when not blank
  - validatesExclusionOf - Require a property value not be included in the specified array
  - validatesFormatOf - Property value must match format
  - validatesInclusionOf - Property value must be in array
  - validatesLengthOf - Must match min or max or is
  - validatesNumericalityOf - Must be a number
  - validatesPresenceOf - Property must be present in model
  - validatesUniquenessOf - Property must be unique for that model - only supported with memory, Oracle, MongoDB
- All methods accept an options param, message and allowNull, along with context specific
- Can call `isValid()` to invoke validation, called automatically when doing create or insert

```javascript
// Examples
module.exports = function(User) {
  User.validatesPresenceOf('name', 'email');
  User.validatesFormatOf('phone', {with: /someregex/});
  User.validatesLengthOf('password', {min: 5, message: {min: 'Password is too short'}});
  User.validatesInclusionOf('gender', {in: ['male', 'female']});
  User.validatesExclusionOf('domain', {in: ['www', 'billing', 'admin']});
  User.validatesNumericalityOf('age', {int: true});
  User.validatesUniquenessOf('email', {message: 'email is not unique'});
  
  // custom validation function
  const validatePositiveInteger = function (err) {
    if (!/^[0-9]*$/.test(this.price)) {
      err();
    }
  }; 
  // invoking the custom validation function
  Product.validate('price', validatePositiveInteger, { message: 'Price should be a positive integer'});
  
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
  const minimalPriceMsg = 'Price must be higher than the minimal price in the database';
  Product.validateAsync('price', validateMinimalPrice, { message: minimalPriceMsg});
};
```

## 8. Unit testing
```shell
# install mocha and chai
npm i --save-dev mocha chai
```
- Specify environment for test
  - Update test run script to specify the env: 
    - `"test": "NODE_ENV=test mocha test/**/*.test.js"`
  - Copy `server/datasources.json` to `server/datasources.test.json` (or whatever env besides test)
  - Change `datasources.test.json` so that the "file" key is set to false
```javascript
'use strict';
// Test helper
const app = require('../server/server');
const chai = require('chai');
const expect = chai.expect;

module.exports = {app, expect};
```

```javascript
'use strict';
// Unit test example
const {app, expect} = require('../common');

// Get the reference to the model through the app
const Product = app.models.Product;

describe('(model) Product', () => {
  it('should have a find() method', () => {
    return Product.find()
      .then(res => console.log(res));
  });
});
```

## 9. Operation Hooks
- Models emit events
- Call static method `observe` to inject a function on the hook
- ctx contains the index
- next when done
```javascript
// Before hooks get ctx and next()
Product.observe('before save', function(ctx, next) {
  // check to ensure that the category id is valid, if provided
  if(ctx.instance && ctx.instance.categoryId) {
    return Product.app.models.Category
      .count({ id: ctx.instance.categoryId })
      .then(res => {
        if (res < 1) {
          return Promise.reject('Error adding product to non-existing category');
        }
      });
  }
  return next();
});
```

```javascript
// After hooks get ctx, return a promise
Category.observe('before delete', function(ctx) {
  return Category.app.models.Product
    .count({categoryId: ctx.where.id})
    .then(res => {
      if (res > 0) {
        return Promise
          .reject('Error deleting category with existing products');
      }
    });
});
```
## 10. Protect resources with ACLs and Authentication
```shell
lb acl
```
- Model: Product
- ACL Scope: All methods and properties
- Access types: All
- Role: Any unauthenticated user
- Permissions to apply: Explicitly deny access
- Model definition has ACL info now

```shell
lb acl
```
- Model: Product
- ACL Scope: A single method
- Method name: find
- Role: Any unauthenticated user
- Permissions to apply: Explicitly grant access
- Use the explorer to post an email and password to `/api/Users`
- Use the explorer to post the same info to `/api/Users/login`
- The response will contain an access token in the id field
- Use the token in the explorer to authenticate
  - `Authorization` header with token
  - `access_token` query string param

## 11. Create a boot script to run on start
```shell
lb boot-script
```
- script name: create-access-token
- type: async
- It creates a function that accepts the app and a callback
- Get any models from `app.models.ModelName`

## 12. Create a MongoDB Datasource
- Create file `server/datasources.local.js`
```javascript
const mongoDbUrl = process.env.MONGODB_URL;

if (mongoDbUrl) {
  console.log(`Using MongoDB url: ${mongoDbUrl}`);
  const dataSources = {
    db: {
      name: 'db',
      connector: 'mongodb',
      url: mongoDbUrl
    }
  };
  module.exports = dataSources;
}
```
- Install connector `npm install loopback-connector-mongodb --save`

## 13. Create a free db on MongoDB Atlas
- https://cloud.mongodb.com/user?nds=true#/login
  - Create account if needed
- Build your new cluster
  - Name, service level, etc
- Click the "connect" button to get the connection string details

mongodb://djheru:somepasswordhere@cluster0-shard-00-00-duq44.mongodb.net:27017,cluster0-shard-00-01-duq44.mongodb.net:27017,cluster0-shard-00-02-duq44.mongodb.net:27017/loopback-api?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin
MONGODB_URL="mongodb://djheru:RD1eD36ydgfRcA1upT4C@cluster0-shard-00-00-duq44.mongodb.net:27017,cluster0-shard-00-01-duq44.mongodb.net:27017,cluster0-shard-00-02-duq44.mongodb.net:27017/database-name?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin"

## 14. Filter model data
- http://loopback.io/doc/en/lb3/Querying-data.html#filters
- Using URL querystring params
- Using JSON stringify data in url
- `include`
  - include results from related models in a query
  - `?filter={"include":"category"}`
  - `/customers?filter[include][reviews]=author&filter[where][age]=21`
    - Return all customers whose age is 21, including their reviews which also includes the author
  - `/customers?filter[include]=reviews&filter[include]=orders`
    - Return all customers including their reviews and orders
- `order`
  - Order by a property on an object
  - `filter[order]=propertyName <ASC|DESC>`
  - `filter[order][0]=propertyName <ASC|DESC>&filter[order][1]propertyName]=<ASC|DESC>`
  - `?filter[order]=audibleRange%20DESC`
  - `?filter={"order": ["categoryId DESC", "price DESC"]}`
- `where`
  - a set of logical conditions to match
  - `filter[where][property]=value`
  - `filter[where][property][op]=value`
  - `filter[where][name][like]=foo`
  - `?filter={"name": {"like": "foo"}}`
  - `?filter={"include":"category", "where": {"name": {"like": "%25off%25"}}}`
- `fields`
  - Specify properties to include/exclude in the results
  - By default, queries return all model properties in results. However, if you specify at least one fields filter with a value of true, then by default the query will include only those you specifically include with filters.
  - `filter[fields][propertyName]=<true|false>&filter[fields][propertyName]=<true|false>...`
  - `?filter[fields][id]=true&filter[fields][make]=true&filter[fields][model]=true`
  - `?filter={"fields":{"id":true,"make":true,"model":true}}`
- `limit`
  - limits the number of records returned to the specified number (or less)
  - `?filter[limit]=n`
- `offset`/`skip` 
  - Omit specified number of returned records (pagination)
  - `?filter[skip]=10`

## 15. Deploy using now.sh
- `npm install -g now`
- `now --login`
  - Create an account if necessary
- Add mongo secrets
  - `now secrets add mongodb-url "mongodb://<connection string>"`
- Inside loopback project: `now -e MONGODB_URL=@mongodb-url`
  - Watch it deploy
- It will display the URL for the deployment after running
- You can also configure from package.json
```json
{
  "now": {
    "name": "some-name",
    "alias": ["some-other-name"],
    "env": {
      "MONGODB_URL": "@mongodb-url",
      "NODE_ENV": "production"
    }
  },
  
  "scripts": {
    "now": "npm run now:deploy && npm run now:alias",
    "now:deploy": "now",
    "now:alias": "now alias"
  }
}
```
