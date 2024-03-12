import { scheduleJobsForSatellitesOnBoot } from "./utils/satellite.utils";

const { connectDB } = require("./database/database");
const server = require("./socket");
const port = process.env.PORT || 8080;

connectDB()
  .then((res: any) => {
    server.listen(port, () => {
      console.log(`[Server]: I am running at https://localhost:${port}`);
    });
    console.log("Connected to db.");
    scheduleJobsForSatellitesOnBoot();
  })
  .catch((err: any) => console.log(err));
