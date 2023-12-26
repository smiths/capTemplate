# Satellite Information

The purpose of this document is to outline design decisions for anything related to tracking a satellite, including, but not limited to, how to track the satellite, and why we track it in the manner we do.

## How are satellites tracked?

To read more about how to read TLEs, check it out [here](https://celestrak.org/NORAD/documentation/tle-fmt.php).

## How does this project track satellites?

TLE data is collected from [space-track.org](https://www.space-track.org), which uses Celestrak data to get TLE information. TLE data will have to be updated regularly as drift (**not currently implemented**), and other spacial conditions may affect the TLE of a satellite.

## How is satellite data obtained?

Satellite information such as position, velocity, and more are calculated through a library, [satellite-js](https://github.com/shashwatak/satellite-js), which uses [SGP4](https://pypi.org/project/sgp4/), a python library for orbital calculations accurate within the 0.1mm. This library is a direct effort of the United States Department of Defense and NASA scientists, for which the publications can be found [here](https://celestrak.org/publications/AIAA/2006-6753/).

The field of orbital mechanics are way out of the scope of 5 software engineers, so we chose to remove the calculations as part of our scope.
