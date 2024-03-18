import { scheduleJobsForSatellitesOnBoot } from "./utils/satellite.utils";

const { connectDB } = require("./database/database");
const SocketServer = require("./socket");
const app = require("./app");
const port = process.env.PORT || 8080;

SocketServer.listen(1549, () => {
  console.log("Listening on port: 1549");
});

connectDB()
  .then((res: any) => {
    app.listen(port, () => {
      console.log(`[Server]: I am running at https://localhost:${port}`);
    });
    console.log("Connected to db.");
    scheduleJobsForSatellitesOnBoot();
  })
  .catch((err: any) => console.log(err));
