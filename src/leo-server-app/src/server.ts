import express, { Express, Request, Response } from "express";
import * as dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config({ path: `.env.local`, override: true });

const app: Express = express();
const cors = require("cors");
const port = 3001;
const satellite = require("satellite.js");
const mongoose = require("mongoose");
const User = require("./models/user");
const Satellite = require("./models/satellite");
const Log = require("./models/log");
const Schedule = require("./models/schedule");

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.km5f8kd.mongodb.net/?retryWrites=true&w=majority`
  )
  .then((res: any) => {
    app.listen(port, () => {
      console.log(`[Server]: I am running at https://localhost:${port}`);
    });
    console.log("Connected to db.");
  })
  .catch((err: any) => console.log(err));

// Allow requests from your React app's origin (http://localhost:3000)
const corsOptions = {
  origin: "http://localhost:3000",
};

app.use(cors(corsOptions));

// NEUDOSE TLE from satnogs
var tleLine1 =
    "1 56315U 98067VG  23289.56381294  .00217706  00000+0  12767-2 0  9999",
  tleLine2 =
    "2 56315  51.6294  74.1402 0004981 252.1253 107.9204 15.77094333 27340";

// GS info
var observerGd = {
  longitude: satellite.degreesToRadians(-79.9201),
  latitude: satellite.degreesToRadians(43.2585),
  height: 0.37,
};

// For more satellite info, check out: https://github.com/shashwatak/satellite-js
function getSatelliteInfo(date: Date) {
  var satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  var positionAndVelocity = satellite.propagate(satrec, date);
  var gmst = satellite.gstime(date);

  var positionEci = positionAndVelocity.position,
    velocityEci = positionAndVelocity.velocity;

  var positionEcf = satellite.eciToEcf(positionEci, gmst),
    positionGd = satellite.eciToGeodetic(positionEci, gmst),
    lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);

  var longitude = satellite.degreesLong(positionGd.longitude),
    latitude = satellite.degreesLat(positionGd.latitude),
    height = positionGd.height;

  var azimuth = satellite.radiansToDegrees(lookAngles.azimuth),
    elevation = satellite.radiansToDegrees(lookAngles.elevation),
    rangeSat = lookAngles.rangeSat;

  return {
    positionEci,
    velocityEci,
    longitude,
    latitude,
    height,
    azimuth,
    elevation,
    rangeSat,
  };
}

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, this is Express + TypeScript");
});

app.get("/getSatelliteInfo", (req, res) => {
  res.json(getSatelliteInfo(new Date()));
});

// Gets passes for next week
app.get("/getNextPasses", (req, res) => {
  // Time window in milliseconds (1 minute)
  const WINDOWMILLIS = 60 * 1000;

  // Elevation Entry
  const MINELEVATION = 10;

  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var nextPasses = [];
  var enterElevation = null;
  var enterInfo;
  var exitInfo;

  // Gets overpasses for the next week
  for (let i = 0; i < 7 * 24 * 60; i++) {
    // Calculate the next pass
    var nextPassTime = new Date(today.getTime() + i * WINDOWMILLIS);

    // Get satellite information for the next pass
    var satelliteInfo = getSatelliteInfo(nextPassTime);

    // Format Time
    const formattedTime = nextPassTime
      .toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(/\u202f/g, " ");

    if (satelliteInfo.elevation > MINELEVATION) {
      if (!enterElevation) {
        enterInfo = {
          type: "Enter",
          time: formattedTime,
          azimuth: satelliteInfo.azimuth,
          elevation: satelliteInfo.elevation,
        };
        enterElevation = satelliteInfo.elevation;
      }
    } else {
      if (enterElevation) {
        exitInfo = {
          type: "Exit",
          time: formattedTime,
          azimuth: satelliteInfo.azimuth,
          elevation: satelliteInfo.elevation,
        };
        nextPasses.push([enterInfo, exitInfo]);
        enterElevation = null;
      }
    }
  }

  res.json({ nextPasses });
});

app.post("/createUser", async (req, res) => {
  const { body } = req;

  console.log(body);

  const newUser = new User({
    email: body.email,
    role: body.role,
    satellites: body.satellites,
  });
  // const user = await User.create(newUser);
  const user = null;
  res.status(201).json({ message: "User Created", user });
});

app.post("/addSatelliteTarget", async (req, res) => {
  const { body } = req;

  const newSatellite = new Satellite({
    name: body.name,
    validCommands: body.validCommands,
    operators: body.operators,
  });

  const user = await Satellite.create(newSatellite);
  res.status(201).json({ message: "Satellite system added", user });
});

app.get("/getAllOperators", async (req, res) => {
  const { body } = req;

  const operators = await User.find({});
  res.status(201).json({ message: "Fetched operators", operators });
});

app.patch("/updateOperatorRole/:userId", async (req, res) => {
  const { body, params } = req;
  const id = new mongoose.Types.ObjectId(params.userId);

  const filter = { _id: id };

  const update = { role: body.body.role };

  await User.findOneAndUpdate(filter, update);

  const operator = await User.findOne(filter);
  res.status(201).json({ message: "Fetched operators", operator });
});

// Scheduling endpoints

// Create schedule
type ScheduleType = {
  body: {
    commands: any[];
    satelliteId: string;
    userId: string;
    executionTimestamp: Date;
  };
};

app.post("/createSchedule", async (req: ScheduleType, res) => {
  const { body } = req;

  // validate commands

  const newSchedule = {
    userId: body.userId,
    satelliteId: body.satelliteId,
    commands: body.commands,
    executionTimestamp: body.executionTimestamp,
    status: false,
    type: "FUTURE",
  };

  const schedule = await Schedule.create(newSchedule);
  res.status(201).json({ message: "Created schdule", schedule });
});

app.post("/getSchedulesBySatellite", async (req, res) => {
  const { body } = req;

  const filter = { satellite: body.satelliteId };

  const schedules = await Schedule.find(filter).exec();
  res.status(201).json({ message: "Fetched operators", schedules });
});

async function sendRequest(
  satelliteId: string,
  scheduleId: string,
  commands: string[]
) {
  // send command to ground station and capture response
  let res = {};

  // create log
  const newLog = {
    data: res,
    satellite: satelliteId,
    schdule: scheduleId,
  };
  const log = await Log.create(newLog);
  return log;
}

// Executing Requests
app.post("/sendLiveRequest", async (req, res) => {
  const { body } = req;

  // validate commands

  // create schedule
  const newSchedule = {
    userId: body.userId,
    satelliteId: body.satelliteId,
    commands: body.commands,
    executionTimestamp: body.executionTimestamp,
    status: false,
  };

  const schedule = await Schedule.create(newSchedule);

  // api request
  const log = await sendRequest(body.satelliteId, schedule._id, body.commands);
  res.status(201).json({ message: "Sent command sequence", log });
});
