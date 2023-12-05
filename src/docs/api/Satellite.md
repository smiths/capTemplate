#Satellite API

Location: `leo-server-app/src/routes/satellite.ts`

The purpose of these endpoint groupings is to access data regarding the satellite, including orbital data, next overpasses, as well as database mangement regarding satellites.

---

# Satellite Endpoints

##`/getSatelliteInfo`
Type: `GET`
Request: `none`
Response: `{
    positionEci,
    velocityEci,
    longitude,
    latitude,
    height,
    azimuth,
    elevation,
    rangeSat
  }`

Returns a dictionary of floats.

This endpoint is for retrieving satellite information. Calculations are done through the `satellite.js` library based off TLE data, found [here](https://github.com/shashwatak/satellite-js). TLE data of a satellite can be found online, like on [n2yo](https://www.n2yo.com/database/?name=NEUDOSE#results).

##`/getNextPasses`
Type: `GET`
Request: `none`
Response: `{ nextPasses }`

Returns an array of `[enterInfo, exitInfo]`, with both being a dictionary of the form:
`{
    type: string,
    time: string,
    azimuth: float,
    elevation: float,
}`. `type` can be "Enter" or "Exit", and time is a formatted human-readable time (i.e 9:00 AM)

This endpoint is for retrieving the next passes for the given week.

---

# Database Endpoints
