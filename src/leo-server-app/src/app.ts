import express, { Express, Request, Response } from "express";
import * as dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config({ path: `.env.local`, override: true });

const app: Express = express();
const cors = require("cors");

const usersRoute = require("./routes/user");
const sateliiteUserRoute = require("./routes/satelliteUser")
const { router: satelliteRoute } = require("./routes/satellite");
const scheduleRoute = require("./routes/schedule");
const logRoute = require("./routes/log");
const pingRoute = require("./routes/ping");

const corsOptions = {
  origin: "http://localhost:3000",
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

// Connect routes to app
app.use("/satelliteUser", sateliiteUserRoute);
app.use("/users", usersRoute);
app.use("/satellite", satelliteRoute);
app.use("/schedule", scheduleRoute);
app.use("/log", logRoute);
app.use("/ping", pingRoute);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, this is Express + TypeScript");
});

module.exports = app;
