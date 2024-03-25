import { scheduleJobsForSatellitesOnBoot } from "./utils/satellite.utils";

const { connectDB } = require("./database/database");
const { AppServer } = require("./app");
const SocketServer = require("./socket");

const appPort = process.env.PORT || 8080;
const socketPort = process.env.SOCKET_PORT || 1549;

SocketServer.listen(socketPort, () => {
  console.log(`Listening on port: ${socketPort}`);
});

connectDB()
  .then((res: any) => {
    AppServer.listen(appPort, () => {
      console.log(`[Server]: I am running at https://localhost:${appPort}`);
    });
    console.log("Connected to db.");
    // scheduleJobsForSatellitesOnBoot();
  })
  .catch((err: any) => console.log(err));
