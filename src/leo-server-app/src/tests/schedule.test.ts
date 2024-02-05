const supertest = require("supertest");
const app = require("../app");
const request = supertest(app);
const { connectDB, disconnectDB } = require("../database/database");

import User from "../models/user";
import Command from "../models/command";
import Satellite from "../models/satellite";
import Schedule from "../models/schedule";
import { ScheduleStatus } from "../types/schedule";
import {
  addSchedulesForNext7Days,
  executeScheduledCommands,
  rescheduleLeftoverCommands,
} from "../utils/schedule.utils";
import { CommandStatus } from "../types/command";

// Globals
let defaultNoradId = "55098";

// Helper methods
const areIdsSame = (array1: string[], array2: string[]) =>
  array1.length === array2.length &&
  array1.every((val) => array2.includes(val));

// -------- Update Schedule Endpoint --------
describe("PATCH /updateScheduledCommand", () => {
  let path = "/schedule/updateScheduledCommand";
  let satelliteId: any;

  let users: any[] = [];

  let pastSchedule: any;
  let futureSchedule: any;
  let commands: any[] = [];

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
    const firstUser = users[0];

    // Create satellite record
    const satellite = await Satellite.create({
      name: "test1",
      noradId: 543,
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
    // Disconnect from mock DB
    await disconnectDB();
  });

  it("Correctly updates existing command record", async () => {
    const newCommand = "start";
    const res = await request.patch(path).query({
      userId: users[0].id,
      commandId: commands[1].id,
      satelliteId: satelliteId,
      command: newCommand,
    });

    expect(res.body.updatedCommand.command).not.toEqual(newCommand);
  });
});

// Test 1 - update correctly

// Test 2 - update with invalid user credentials

// Test 3 - update as ADMIN

// Test 4 - update with invalid ids

// Test 5 - Update with invalid command sequence

// -------- GET Schedules by Satellite Endpoint --------
describe("GET /getSchedulesBySatellite", () => {
  let path = "/schedule/getSchedulesBySatellite";
  let satelliteId: any;
  let passedSchedules: any[] = [];
  let futureSchedules: any[] = [];

  beforeAll(async () => {
    // Connect to mock DB
    await connectDB("test");

    // Create satellite record
    const satellite = await Satellite.create({
      name: "test1",
      noradId: 543,
      validCommands: ["teardown", "start"],
    });

    satelliteId = satellite.id;

    // Create future schedules
    const _futureSchedules = [
      {
        startDate: new Date(Date.now() + 1000),
        endDate: new Date(Date.now() + 10000),
        satelliteId: satellite.id,
      },
      {
        startDate: new Date(Date.now() + 100),
        endDate: new Date(Date.now() + 900),
        satelliteId: satellite.id,
      },
    ];

    futureSchedules = await Schedule.create(_futureSchedules);

    // Create passed schedules
    const _passedSchedules = [
      {
        startDate: new Date(Date.now() - 1000),
        endDate: new Date(Date.now() - 10000),
        satelliteId: satellite.id,
        status: ScheduleStatus.PASSED,
      },
      {
        startDate: new Date(Date.now() - 100),
        endDate: new Date(Date.now() - 900),
        satelliteId: satellite.id,
        status: ScheduleStatus.PASSED,
      },
    ];

    passedSchedules = await Schedule.create(_passedSchedules);
  });

  afterAll(async () => {
    // Disconnect from mock DB
    await disconnectDB();
  });

  it("Correctly fetches future schedules for a satellite", async () => {
    const res = await request.get(path).query({
      satelliteId: satelliteId,
    });

    // Same records should be returned
    const expectedIds = futureSchedules.map((item) => item.id);
    const actualIds = res.body.schedules
      ? res.body.schedules.map((item: any) => item._id)
      : [];

    expect(areIdsSame(actualIds, expectedIds)).toBe(true);
  });

  it("Correctly fetches past schedules for a satellite", async () => {
    const res = await request.get(path).query({
      satelliteId: satelliteId,
      status: ScheduleStatus.PASSED,
    });

    // Same records should be returned
    const expectedIds = passedSchedules.map((item) => item.id);
    const actualIds = res.body.schedules
      ? res.body.schedules.map((item: any) => item._id)
      : [];

    expect(areIdsSame(actualIds, expectedIds)).toBe(true);
  });
});

// -------- GET Commands by Schedule Endpoint --------
describe("GET /getCommandsBySchedule", () => {
  let path = "/schedule/getCommandsBySchedule";
  let schedule: any;
  let commands: any[] = [];

  beforeAll(async () => {
    // Connect to mock DB
    await connectDB("test");

    // Create user record
    const user_1 = await User.create({
      email: "test4@gmail.com",
      role: "OPERATOR",
    });

    // Create satellite record
    const satellite = await Satellite.create({
      name: "test1",
      noradId: 543,
      validCommands: ["teardown", "start"],
    });

    // Create schedule record
    const _schedule = {
      startDate: new Date(Date.now() + 1000),
      endDate: new Date(Date.now() + 10000),
      satelliteId: satellite.id,
    };

    schedule = await Schedule.create(_schedule);

    //  Create Command records
    const _commands = [
      {
        command: "teardown",
        satelliteId: satellite.id,
        userId: user_1.id,
        scheduleId: schedule.id,
      },
      {
        command: "teardown",
        satelliteId: satellite.id,
        userId: user_1.id,
        scheduleId: schedule.id,
      },
    ];

    commands = await Command.create(_commands);
  });

  afterAll(async () => {
    // Disconnect from mock DB
    await disconnectDB();
  });

  it("Correctly fetches commands for a schedule", async () => {
    const res = await request.get(path).query({
      scheduleId: schedule.id,
    });

    // Same records should be returned
    const expectedIds = commands.map((item) => item.id);
    const actualIds = res.body.commands
      ? res.body.commands.map((item: any) => item._id)
      : [];

    expect(areIdsSame(actualIds, expectedIds)).toBe(true);
  });
});

// -------- Remove Scheduled Command Endpoint --------
describe("DELETE /deleteScheduledCommand", () => {
  let path = "/schedule/deleteScheduledCommand";
  let users: any[] = [];
  let schedule: any;
  let commands: any[] = [];

  beforeAll(async () => {
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
    const firstUser = users[0];

    // Create satellite record
    const satellite = await Satellite.create({
      name: "test1",
      noradId: 543,
      validCommands: ["teardown", "start"],
    });

    // Create schedules
    schedule = await Schedule.create({
      startDate: new Date(Date.now() + 1000),
      endDate: new Date(Date.now() + 100),
      satelliteId: satellite.id,
      status: ScheduleStatus.PASSED,
    });

    // Create command records
    const _commands = [
      {
        command: "teardown",
        satelliteId: satellite.id,
        userId: firstUser.id,
        scheduleId: schedule.id,
      },
      {
        command: "teardown",
        satelliteId: satellite.id,
        userId: firstUser.id,
        scheduleId: schedule.id,
      },
    ];

    commands = await Command.create(_commands);
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it("Correctly deletes command record from schedule", async () => {
    // delete record
    await request.delete(path).query({
      userId: users[0].id,
      commandId: commands[1].id,
    });

    const cmd = await Command.findById(commands[1].id);
    expect(cmd).toBeNull();
  });
});

describe("UTIL executeScheduledCommands", () => {
  let satelliteId: string;
  let scheduleId: string;

  beforeAll(async () => {
    // Connect to mock DB
    await connectDB("test");

    // First create users
    const user_1 = new User({
      email: "test4@gmail.com",
      role: "OPERATOR",
    });

    const user = await User.create(user_1);

    // Create satellite record
    const satellite = await Satellite.create({
      name: "test1",
      noradId: 543,
      validCommands: ["teardown", "start"],
    });

    satelliteId = satellite.id;

    // Create schedules
    const overpassStart = new Date();
    overpassStart.setDate(overpassStart.getDate() + 1);

    const overpassEnd = new Date();
    overpassEnd.setDate(overpassStart.getDate() + 1);

    let schedule = await Schedule.create({
      startDate: new Date(Date.now()),
      endDate: new Date(Date.now() + 100),
      satelliteId: satellite.id,
      status: ScheduleStatus.FUTURE,
    });

    scheduleId = schedule.id;

    // Create command records
    const commands = [
      {
        command: "teardown",
        satelliteId: satellite.id,
        userId: user.id,
        scheduleId: schedule.id,
      },
      {
        command: "teardown",
        satelliteId: satellite.id,
        userId: user.id,
        scheduleId: schedule.id,
      },
    ];

    await Command.create(commands);
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it("Commands are executed for this overpass", async () => {
    await executeScheduledCommands(satelliteId, scheduleId);
    const commandsExecuted = await Command.find({
      scheduleId: scheduleId,
    }).exec();

    let areCommandsExecuted = true;

    for (const command of commandsExecuted) {
      if (command.status !== CommandStatus.EXECUTED) {
        areCommandsExecuted = false;
        break;
      }
    }

    expect(areCommandsExecuted).toBeTruthy();
  });
});

describe("UTIL rescheduleLeftoverCommands", () => {
  let satelliteId: string;
  let pastScheduleId: string;
  let futureScheduleId: string;

  beforeAll(async () => {
    // Connect to mock DB
    await connectDB("test");

    // First create users
    const user_1 = new User({
      email: "test4@gmail.com",
      role: "OPERATOR",
    });

    const user = await User.create(user_1);

    // Create satellite record
    const satellite = await Satellite.create({
      name: "test1",
      noradId: 543,
      validCommands: ["teardown", "start"],
    });

    satelliteId = satellite.id;

    // Create schedules
    const overpassStart = new Date();
    overpassStart.setDate(overpassStart.getDate() + 1);

    const overpassEnd = new Date();
    overpassEnd.setDate(overpassStart.getDate() + 1);

    // Create past and future schedule
    const pastSchedule = await Schedule.create({
      startDate: new Date(Date.now() - 1000),
      endDate: new Date(Date.now() - 100),
      satelliteId: satellite.id,
      status: ScheduleStatus.PASSED,
    });

    const futureSchedule = await Schedule.create({
      startDate: overpassStart,
      endDate: overpassEnd,
      satelliteId: satellite.id,
      status: ScheduleStatus.FUTURE,
    });

    // Store these schedule ids
    pastScheduleId = pastSchedule.id;
    futureScheduleId = futureSchedule.id;

    // Create command records tied to past Schedule
    const commands = [
      {
        command: "teardown",
        satelliteId: satellite.id,
        userId: user.id,
        scheduleId: pastSchedule.id,
      },
      {
        command: "teardown",
        satelliteId: satellite.id,
        userId: user.id,
        scheduleId: pastSchedule.id,
      },
    ];

    await Command.create(commands);
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it("Commands should be rescheduled", async () => {
    await rescheduleLeftoverCommands(satelliteId, pastScheduleId);

    const commandsQueued = await Command.find({
      scheduleId: futureScheduleId,
    }).exec();

    expect(commandsQueued.length > 0).toBeTruthy();
  });
});

describe("UTIL addSchedulesForNext7Days", () => {
  let satelliteId: string;
  let noradId: string;

  beforeAll(async () => {
    // Connect to mock DB
    await connectDB("test");

    // Create satellite record
    const satellite = await Satellite.create({
      name: "test1",
      noradId: defaultNoradId,
      validCommands: ["teardown", "start"],
    });

    satelliteId = satellite.id;
    noradId = satellite.noradId;
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it("Satellite should have schedules", async () => {
    //  Add schedules
    await addSchedulesForNext7Days(satelliteId, noradId);
    const schedules = await Schedule.find({ satelliteId: satelliteId });

    expect(schedules.length > 0).toBeTruthy();
  });
});
