const { getSatelliteInfo } = require("../routes/satellite");

var defaultTleLine1 =
    "1 55098U 23001CT  23359.66872105  .00021921  00000-0  89042-3 0  9991",
  defaultTleLine2 =
    "2 55098  97.4576  58.0973 0014812  57.5063 302.7604 15.24489013 54199";
let date = new Date();

describe("Satellite Information Tests", () => {
  test("Valid TLE", () => {
    expect(
      getSatelliteInfo(new Date(), defaultTleLine1, defaultTleLine2)
    ).toBeDefined();
  });

  test("Invalid TLE", () => {
    expect(getSatelliteInfo(new Date(), "", "")).toBeDefined();
  });
});
