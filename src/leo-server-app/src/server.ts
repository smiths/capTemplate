import express, { Express, Request, Response } from "express";
import * as dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config({ path: `.env.local`, override: true });

const app: Express = express();
const cors = require("cors");
const port = 3001;
const mongoose = require("mongoose");

const usersRoute = require("./routes/user");
const { router: satelliteRoute } = require("./routes/satellite");
const scheduleRoute = require("./routes/schedule");
const logRoute = require("./routes/log");

// Allow requests from your React app's origin (http://localhost:3000)
const corsOptions = {
  origin: "http://localhost:3000",
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

// Connect routes to app
app.use("/users", usersRoute);
app.use("/satellite", satelliteRoute);
app.use("/schedule", scheduleRoute);
app.use("/log", logRoute);

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.km5f8kd.mongodb.net/?retryWrites=true&w=majority`
  )
  .then((res: any) => {
    app.listen(port, () => {
      console.log(`[Server]: I am running at https://localhost:${port}`);
    });
    console.log("Connected to db.");
  })
  .catch((err: any) => console.log(err));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, this is Express + TypeScript");
});

module.exports = app;

// Gets passes for next week

// Scheduling endpoints

// Create schedule
