const supertest = require("supertest");
const app = require("../app");
const request = supertest(app);
const { connectDB, disconnectDB } = require("../database/database");

import User from "../models/user";
import SatelliteUser from "../models/satelliteUser";
import Satellite from "../models/satellite";

// Helper methods
const areIdsSame = (array1: string[], array2: string[]) =>
  array1.length === array2.length &&
  array1.every((val) => array2.includes(val));

// -------- Update Schedule Endpoint --------
describe("PATCH /updateSatelliteUser", () => {
  let path = "/satelliteUser/updateByUser";
  let satelliteId: any;
  let satUser: any;
  let users: any[] = [];

  beforeAll(async () => {
    // Connect to mock DB
    await connectDB("test");

    // First create users
    const user_1 = new User({
      email: "test4@gmail.com",
      role: "OPERATOR",
    });
    const user_2 = new User({
      email: "test5@gmail.com",
      role: "OPERATOR",
    });
    const user_3 = new User({
      email: "test6@gmail.com",
      role: "ADMIN",
    });
    
    users = await User.create([user_1, user_2, user_3]);

    const satellite = await Satellite.create({
      name: "test1",
      noradId: 543,
      validCommands: ["teardown", "start"],
    });

    satelliteId = satellite.id;

    const satUser1 = new SatelliteUser({
      userId: users[0].id,
      satelliteId: satelliteId,
      validCommands: ["start"],
      adminId: users[2].id,
    });

    satUser = await SatelliteUser.create(satUser1);

  });

  afterAll(async () => {
    // Disconnect from mock DB
    await disconnectDB();
  });

  it("Correctly updates existing satellite User", async () => {
    const newCommand = ["teardown"];
    const res = await request.patch(path).query({
      satelliteUserId: satUser.id,
      validCommands: newCommand,
      satelliteId: satelliteId,
      adminId: users[2].id,
    });

    expect(res.body.updatedUserCommands?.validCommands).not.toEqual(newCommand);
  });

  it("User with not ADMIN role tries to update commands", async () => {
    const newCommand = ["teardown"];
    const res = await request.patch(path).query({
      satelliteUserId: satUser.id,
      validCommands: newCommand,
      satelliteId: satelliteId,
      adminId: users[1].id,
    });

    expect(res.status).toEqual(500);
  });

  it("Invalid SatelliteUserId", async () => {
    const newCommand = ["teardown"];
    const res = await request.patch(path).query({
      satelliteUserId: users[0].id,
      validCommands: newCommand,
      satelliteId: satelliteId,
      adminId: users[2].id,
    });

    expect(res.status).toEqual(500);
  });

  it("Reject invalid command sequence", async () => {
    const newCommand = ["teardown", "hello"];
    const res = await request.patch(path).query({
      satelliteUserId: satUser.id,
      validCommands: newCommand,
      satelliteId: satelliteId,
      adminId: users[2].id,
    });

    expect(res.status).toEqual(500);
  });
});