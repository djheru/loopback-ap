const mongoDbUrl = process.env.MONGODB_URL;

if (!!mongoDbUrl) {
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
