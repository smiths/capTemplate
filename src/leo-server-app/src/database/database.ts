const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const { io } = require("../app");

let mongod: any = null;

const connection = mongoose.connection;

const connectDB = async (mode?: string) => {
  let dbUrl = process.env.DB_URI;

  if (process.env.NODE_ENV === "test") {
    mongod = await MongoMemoryServer.create();
    dbUrl = mongod.getUri();
  }

  const conn = await mongoose.connect(dbUrl);
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

if (process.env.NODE_ENV !== "test") {
  connection.once("open", function () {
    const changeStream = connection.collection("logs").watch();

    changeStream.on("change", (change: any) => {
      io.of("/logs_connect").emit("logUpdate", change); // Emitting change to all connected clients
    });
  });
}

module.exports = { connectDB, disconnectDB };
