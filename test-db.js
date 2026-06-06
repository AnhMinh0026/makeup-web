const mongoose = require('mongoose');

const uri = "mongodb://admin:admin123@ac-jngazxx-shard-00-00.rlchsgx.mongodb.net:27017,ac-jngazxx-shard-00-01.rlchsgx.mongodb.net:27017,ac-jngazxx-shard-00-02.rlchsgx.mongodb.net:27017/?ssl=true&replicaSet=atlas-7ylbsn-shard-0&authSource=admin&appName=MakeupCluster";

async function run() {
  await mongoose.connect(uri);
  console.log("Connected");
  const db = mongoose.connection.db;
  const docs = await db.collection('schedules').find({}).toArray();
  console.log("Found", docs.length, "docs");
  if (docs.length > 0) {
    console.log("First document structure:", JSON.stringify(docs[0], null, 2));
  }
  await mongoose.disconnect();
}

run().catch(console.error);
