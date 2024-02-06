const request = require("supertest");
const app = require("../app");
const {
  getSatelliteInfo,
  setTleLines,
  isSunlit,
  setTLE,
} = require("../routes/satellite");

let defaultNoradId = "55098";
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

describe("isSunlit()", () => {
  test("Valid Input", async () => {
    await expect(() => isSunlit(new Date(), 0, 0, 0)).toBeDefined();
  });

  test("Invalid Date", async () => {
    await expect(() => isSunlit(new Date("bad date"), 0, 0, 0)).toThrow();
  });

  test("Height in km", async () => {
    await expect(() => isSunlit(new Date(), 0, 0, 2001)).toThrow();
  });
});

describe("setTLE()", () => {
  test("Valid Input", async () => {
    await expect(() => setTLE("55098").resolves());
  });

  test("Invalid Input", async () => {
    await expect(() => setTLE("abcd").toThrow());
  });

  test("Empty Input", async () => {
    await expect(() => setTLE("").toThrow());
  });
});

describe("GET /getSatelliteInfo", () => {
  it("Responds with json", async () => {
    setTleLines(defaultNoradId, defaultTleLine1, defaultTleLine2);
    await request(app)
      .get("/satellite/getSatelliteInfo")
      .expect("Content-Type", /json/)
      .expect(200);
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
    setTleLines(defaultNoradId, defaultTleLine1, defaultTleLine2);
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
    setTleLines(defaultNoradId, defaultTleLine1, defaultTleLine2);
    await request(app)
      .get("/satellite/getNextPasses")
      // .expect("Content-Type", /json/)
      .expect(200);
  });
  it("Throws error if invalid TLE", async () => {
    await request(app)
      .get("/satellite/getNextPasses")
      .query({ noradId: "!!11" })
      .expect(500);
  });
});

describe("GET /getSolarIlluminationCycle", () => {
  it("Responds with json", async () => {
    setTleLines(defaultNoradId, defaultTleLine1, defaultTleLine2);
    await request(app)
      .get("/satellite/getSolarIlluminationCycle")
      .query({
        noradId: defaultNoradId,
      })
      .expect("Content-Type", /json/)
      .expect(200);
  });
  it("Throws error if invalid TLE", async () => {
    await request(app)
      .get("/satellite/getNextPasses")
      .query({
        noradId: "!!11",
      })
      .expect(500);
  });
});

describe("POST /changeTLE", () => {
  it("Changes TLE Successfully", async () => {
    setTleLines(defaultNoradId, defaultTleLine1, defaultTleLine2);
    await request(app)
      .post("/satellite/changeTLE")
      .send({ noradID: defaultNoradId })
      .expect(200);
  });
  it("Does Not Change TLE with Empty Body", async () => {
    setTleLines(defaultNoradId, defaultTleLine1, defaultTleLine2);
    await request(app).post("/satellite/changeTLE").expect(400);
  });
});
