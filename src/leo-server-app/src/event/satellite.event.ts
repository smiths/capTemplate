import EventEmitter from "node:events";
import { addSchedulesForNext7Days } from "../utils/schedule.utils";

export const SatelliteEventEmitter = new EventEmitter();

SatelliteEventEmitter.on(
  "satelliteCreated",
  (satelliteId: string, noradId: string) => {
    addSchedulesForNext7Days(satelliteId, noradId);
  }
);
