import { scheduleJobsForSatellitesOnBoot } from "./utils/satellite.utils";

const { connectDB } = require("./database/database");
const AppServer = require("./app");

const appPort = process.env.PORT || 8080;

connectDB()
  .then((res: any) => {
    AppServer.listen(appPort, () => {
      console.log(`[Server]: I am running at https://localhost:${appPort}`);
    });
    console.log("Connected to db.");
    scheduleJobsForSatellitesOnBoot();
  })
  .catch((err: any) => console.log(err));
