const fs = require("fs");
const connect = require("./db");

async function importMovies() {
  const db = await connect();
  const collection = db.collection("movies");

  const rawData = fs.readFileSync("movies.json");
  const movies = JSON.parse(rawData);

  await collection.deleteMany({}); 
  await collection.insertMany(movies);

  console.log("✅ Filmer importerade till MongoDB!");
  process.exit();
}

importMovies();
