const mongoose = require("mongoose");

const { MongoMemoryServer } = require("mongodb-memory-server");
let mongod: any = null;

const connectDB = async (mode?: string) => {
  //   try {
  let dbUrl = process.env.DB_URI;
  console.log(process.env.NODE_ENV);
  //   if (process.env.NODE_ENV === "test") {
  if (process.env.NODE_ENV === "test") {
    mongod = await MongoMemoryServer.create();
    dbUrl = mongod.getUri();
  }

  const conn = await mongoose.connect(dbUrl);

  console.log(`MongoDB connected: ${conn.connection.host}`);
  //   } catch (err) {
  //     console.log(err);
  //     process.exit(1);
  //   }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = { connectDB, disconnectDB };
