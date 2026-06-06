const mongoose = require('mongoose');

const uri = "mongodb://admin:admin123@ac-jngazxx-shard-00-00.rlchsgx.mongodb.net:27017,ac-jngazxx-shard-00-01.rlchsgx.mongodb.net:27017,ac-jngazxx-shard-00-02.rlchsgx.mongodb.net:27017/?ssl=true&replicaSet=atlas-7ylbsn-shard-0&authSource=admin&appName=MakeupCluster";

async function run() {
  await mongoose.connect(uri);
  console.log("Connected");
  const db = mongoose.connection.db;
  
  // Delete documents that don't have startTime or endTime
  const res = await db.collection('schedules').deleteMany({
    $or: [
      { startTime: { $exists: false } },
      { endTime: { $exists: false } },
      { status: { $exists: true } }
    ]
  });
  console.log("Deleted", res.deletedCount, "malformed documents.");
  await mongoose.disconnect();
}

run().catch(console.error);
