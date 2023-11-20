const express = require("express");
const Satellite = require("../models/satellite");
const User = require("../models/user");
const satellite = require("satellite.js");

const router = express.Router();
router.use(express.json());

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

router.get("/getSatelliteInfo", (req: any, res: any) => {
  res.json(getSatelliteInfo(new Date()));
});

router.get("/getNextPasses", (req: any, res: any) => {
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

router.post("/addSatelliteTarget", async (req: any, res: any) => {
  const { body } = req;

  const newSatellite = new Satellite({
    name: body.name,
    validCommands: body.validCommands,
    operators: body.operators,
  });

  const user = await Satellite.create(newSatellite);
  res.status(201).json({ message: "Satellite system added", user });
});

router.post("/addOperatorToSatellite", async (req: any, res: any) => {
  const { body } = req;

  let isUserInSatellite = false;
  let resMsg = {};

  //   Check if user exists, if not create record
  let user = await User.exists({ email: body.email });
  if (!user) {
    const newUser = new User({
      email: body.email,
      role: body.role,
      satellites: [],
    });
    user = await User.create(newUser);
  } else {
    // Check if user is already in satellite
    isUserInSatellite = await User.exists({
      _id: user._id,
      satellites: body.satelliteId,
    });
  }

  if (isUserInSatellite) {
    resMsg = {
      message: "Operator is already in satellite",
      updateSatellite: undefined,
    };
  } else {
    // Update satellite and users to include references
    const updateSatellite = await Satellite.findByIdAndUpdate(
      body.satelliteId,
      {
        $push: { operators: user._id },
      }
    );

    await User.findByIdAndUpdate(user._id, {
      $push: { satellites: body.satelliteId },
    });
    resMsg = { message: "Operator added", updateSatellite };
  }

  //   const user = await Satellite.create(updateSatellite);
  res.status(201).json(resMsg);
});

module.exports = router;
