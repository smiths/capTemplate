import EventEmitter from "node:events";
import { addSchedulesForNext7Days } from "../utils/schedule.utils";

export const SatelliteEventEmitter = new EventEmitter();

/* This event will run anytime a new satellite has been added
 * It creates overpass schedulesfor the next 7 days
 */
SatelliteEventEmitter.on(
  "satelliteCreated",
  (satelliteId: string, noradId: string) => {
    addSchedulesForNext7Days(satelliteId, noradId);
  }
);
