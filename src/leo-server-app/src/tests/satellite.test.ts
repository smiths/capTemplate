const request = require("supertest");
const app = require("../app");
const { getSatelliteInfo, setTleLines } = require("../routes/satellite");

let defaultTleLine1 =
    "1 55098U 23001CT  23359.66872105  .00021921  00000-0  89042-3 0  9991",
  defaultTleLine2 =
    "2 55098  97.4576  58.0973 0014812  57.5063 302.7604 15.24489013 54199";

describe("getSatelliteInfo()", () => {
  test("Valid TLE", async () => {
    await expect(() =>
      getSatelliteInfo(new Date(), defaultTleLine1, defaultTleLine2)
    ).toBeDefined();
  });

  test("Invalid TLE", async () => {
    await expect(() => getSatelliteInfo(new Date(), null, null)).toThrow();
  });

  test("Valid TLE with Valid Date", async () => {
    await expect(() =>
      getSatelliteInfo(
        new Date("2024-01-06T10:15:00Z"),
        defaultTleLine1,
        defaultTleLine2
      )
    ).toBeDefined();
  });

  test("Valid TLE with Invalid Date", async () => {
    await expect(() =>
      getSatelliteInfo(new Date("bad date"), defaultTleLine1, defaultTleLine2)
    ).toThrow();
  });
});

describe("GET /getSatelliteInfo", () => {
  it("Responds with json", async () => {
    setTleLines(defaultTleLine1, defaultTleLine2);
    await request(app)
      .get("/satellite/getSatelliteInfo")
      .expect("Content-Type", /json/)
      .expect(200);
  });
  it("Throws error if invalid TLE", async () => {
    setTleLines(null, null);
    await request(app).get("/satellite/getSatelliteInfo").expect(500);
  });
});

describe("GET /getPolarPlotData", () => {
  it("Responds with json", async () => {
    setTleLines(defaultTleLine1, defaultTleLine2);
    let startTime = "2024-01-06T10:15:00Z";
    let endTime = "2024-01-06T10:22:00Z";
    await request(app)
      .get(
        "/satellite/getPolarPlotData?START_DATE=" +
          startTime +
          "&END_DATE=" +
          endTime
      )
      .expect("Content-Type", /json/)
      .expect(200);
  });
  it("Throws error if invalid Date", async () => {
    setTleLines(defaultTleLine1, defaultTleLine2);
    await request(app)
      .get(
        "/satellite/getPolarPlotData?START_DATE=bad_string&END_DATE=bad_string"
      )
      .expect(500);
  });
});

describe("GET /getMaxElevation", () => {
  it("Responds with json", async () => {
    setTleLines(defaultTleLine1, defaultTleLine2);
    let startTime = "2024-01-06T10:15:00Z";
    let endTime = "2024-01-06T10:22:00Z";
    await request(app)
      .get(
        "/satellite/getMaxElevation?START_DATE=" +
          startTime +
          "&END_DATE=" +
          endTime
      )
      .expect("Content-Type", /json/)
      .expect(200);
  });
  it("Throws error if invalid Date", async () => {
    setTleLines(defaultTleLine1, defaultTleLine2);
    await request(app)
      .get(
        "/satellite/getMaxElevation?START_DATE=bad_string&END_DATE=bad_string"
      )
      .expect(500);
  });
});

describe("GET /getNextPasses", () => {
  it("Responds with json", async () => {
    setTleLines(defaultTleLine1, defaultTleLine2);
    await request(app)
      .get("/satellite/getNextPasses")
      .expect("Content-Type", /json/)
      .expect(200);
  });
  it("Throws error if invalid TLE", async () => {
    setTleLines(null, null);
    await request(app).get("/satellite/getNextPasses").expect(500);
  });
});
