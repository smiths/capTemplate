const supertest = require("supertest");
const app = require("../app");
const request = supertest(app);
const mongoose = require("mongoose");
const { connectDB, disconnectDB } = require("../database/database");

const { MongoClient } = require("mongodb");
import User from "../models/user";
import Command from "../models/command";
import Satellite from "../models/satellite";
import Schedule from "../models/schedule";
import { ScheduleStatus } from "../types/schedule";

// -------- Update Schedule Endpoint --------

describe("PATCH /updateScheduledCommand", () => {
  let path = "/schedule/updateScheduledCommand";
  let satelliteId: any;

  let users: any[] = [];

  let pastSchedule: any;
  let futureSchedule: any;
  let commands: any[] = [];

  beforeAll(async () => {
    console.log(process.env.NODE_ENV);
    connectDB("test");

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
    const firstUser = users[0];

    // Create satellite record
    const satellite = await Satellite.create({
      name: "test1",
      intlCode: 543,
      validCommands: ["teardown", "start"],
    });

    satelliteId = satellite.id;

    // Create schedules
    const overpassStart = new Date();
    overpassStart.setDate(overpassStart.getDate() + 1);

    const overpassEnd = new Date();
    overpassEnd.setDate(overpassStart.getDate() + 1);

    pastSchedule = await Schedule.create({
      startDate: new Date(Date.now() - 1000),
      endDate: new Date(Date.now() - 100),
      satelliteId: satellite.id,
      status: ScheduleStatus.PASSED,
    });

    futureSchedule = await Schedule.create({
      startDate: overpassStart,
      endDate: overpassEnd,
      satelliteId: satellite.id,
      status: ScheduleStatus.FUTURE,
    });

    // Create command records
    const pastCommand = {
      command: "teardown",
      satelliteId: satellite.id,
      userId: firstUser.id,
      scheduleId: pastSchedule.id,
    };
    const futureCommand = {
      command: "teardown",
      satelliteId: satellite.id,
      userId: firstUser.id,
      scheduleId: futureSchedule.id,
    };

    commands = await Command.create([pastCommand, futureCommand]);
  });

  afterAll(async () => {
    disconnectDB();
  });

  it("Correctly updates existing command record", async () => {
    const newCommand = "start";
    const res = await request.patch(path).query({
      userId: users[0].id,
      commandId: commands[1].id,
      satelliteId: satelliteId,
      command: newCommand,
    });

    expect(res.body.updatedCommand.command).toEqual(newCommand);
  });
});

// Test 1 - update correctly

// Test 2 - update with invalid user credentials

// Test 3 - update as ADMIN

// Test 4 - update with invalid ids

// Test 5 - Update with invalid command sequence
