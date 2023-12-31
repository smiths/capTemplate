import * as dotenv from "dotenv";
const request = require("supertest");
const app = require("../server");
const { getSatelliteInfo, setTleLines } = require("../routes/satellite");

dotenv.config({ path: `.env.local`, override: true });

beforeEach(() => {
  process.env = Object.assign(process.env, {
    SPACE_TRACK_USERNAME: process.env.SPACE_TRACK_USERNAME,
    SPACE_TRACK_PASSWORD: process.env.SPACE_TRACK_PASSWORD,
  });
});

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
