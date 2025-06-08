const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const dbName = "movieApp";

async function connect() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB server");
    return client.db(dbName);
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    throw err;
  }
}

module.exports = connect;