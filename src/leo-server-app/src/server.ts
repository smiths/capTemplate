import express, { Express, Request, Response } from "express";

const app: Express = express();
const cors = require('cors');
const port = 3001;
const satellite = require('satellite.js');

// Allow requests from your React app's origin (http://localhost:3000)
const corsOptions = {
  origin: 'http://localhost:3000',
};

app.use(cors(corsOptions));

// NEUDOSE TLE from satnogs
var tleLine1 = '1 56315U 98067VG  23289.56381294  .00217706  00000+0  12767-2 0  9999',
    tleLine2 = '2 56315  51.6294  74.1402 0004981 252.1253 107.9204 15.77094333 27340';  

// GS info
var observerGd = {
    longitude: satellite.degreesToRadians(-79.9201),
    latitude: satellite.degreesToRadians(43.2585),
    height: 0.370
};

// For more satellite info, check out: https://github.com/shashwatak/satellite-js
function getSatelliteInfo(date: Date){
   var satrec = satellite.twoline2satrec(tleLine1, tleLine2);
  
  var positionAndVelocity = satellite.propagate(satrec, date);
  var gmst = satellite.gstime(date);
  
  var positionEci = positionAndVelocity.position,
      velocityEci = positionAndVelocity.velocity;

  var positionEcf   = satellite.eciToEcf(positionEci, gmst),
      positionGd    = satellite.eciToGeodetic(positionEci, gmst),
      lookAngles    = satellite.ecfToLookAngles(observerGd, positionEcf)

  var longitude = satellite.degreesLong(positionGd.longitude),
      latitude  = satellite.degreesLat(positionGd.latitude),
      height    = positionGd.height;

  var azimuth   = satellite.radiansToDegrees(lookAngles.azimuth),
      elevation = satellite.radiansToDegrees(lookAngles.elevation),
      rangeSat  = lookAngles.rangeSat;
  
  return {positionEci, velocityEci, longitude, latitude, height, azimuth, elevation, rangeSat}
}
      
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, this is Express + TypeScript");
});


app.get('/getSatelliteInfo', (req, res) => {
  res.json(getSatelliteInfo(new Date()));  
});

// Gets passes for next week
app.get('/getNextPasses', (req, res) => {

  // Time window in milliseconds (1 minute)
  const WINDOWMILLIS = 60 * 1000;

  // Elevation Entry
  const MINELEVATION = 10;

  var today = new Date()
  today.setHours(0,0,0,0);
  
  var nextPasses = [];
  var enterElevation = null;
  var enterInfo;
  var exitInfo;

  // Gets overpasses for the next week
  for (let i = 0; i < 7 * 24 * 60 ; i++){

    // Calculate the next pass
    var nextPassTime = new Date(today.getTime() + i * WINDOWMILLIS);

    // Get satellite information for the next pass
    var satelliteInfo = getSatelliteInfo(nextPassTime)

    // Format Time
    const formattedTime = nextPassTime.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\u202f/g, ' ');

    if (satelliteInfo.elevation > MINELEVATION) {

      if (!enterElevation){

         enterInfo = {
          type: "Enter",
          time: formattedTime,
          azimuth:satelliteInfo.azimuth,
          elevation: satelliteInfo.elevation,
          };  
        enterElevation = satelliteInfo.elevation;
      } 

    } else {

      if (enterElevation){
        
        exitInfo = {
          type: "Exit",
          time: formattedTime,
          azimuth:satelliteInfo.azimuth,
          elevation: satelliteInfo.elevation,
        };
        nextPasses.push([enterInfo,exitInfo])
        enterElevation = null;
      }
    }

  }

  res.json({nextPasses});
  
});

app.listen(port, () => {
  console.log(`[Server]: I am running at https://localhost:${port}`);
});
