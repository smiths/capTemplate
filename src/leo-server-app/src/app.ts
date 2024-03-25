import express, { Express, Request, Response } from "express";
import * as dotenv from "dotenv";
import * as http from "http";
import bodyParser from "body-parser";

// import routes
const usersRoute = require("./routes/user");
const sateliiteUserRoute = require("./routes/satelliteUser");
const { router: satelliteRoute } = require("./routes/satellite");
const scheduleRoute = require("./routes/schedule");
const logRoute = require("./routes/log");
const pingRoute = require("./routes/ping");
const forwarderRoute = require("./routes/forwarder");
const { Server } = require("socket.io");

const cors = require("cors");

// Load env
dotenv.config({
  path: `.env.${
    (process.env.NODE_ENV === "development" ? "local" : process.env.NODE_ENV) ||
    "local"
  }`,
  override: true,
});

const app: Express = express();

// Configure cors
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// -------- Express HTTP routes --------
app.use("/satelliteUser", sateliiteUserRoute);
app.use("/users", usersRoute);
app.use("/satellite", satelliteRoute);
app.use("/schedule", scheduleRoute);
app.use("/log", logRoute);
app.use("/ping", pingRoute);
app.use("/forwarder", forwarderRoute);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, this is Express + TypeScript");
});

// Create HTTP server instance
const AppServer = http.createServer(app);
const io = new Server(AppServer, {
  cors: {
    origin: "*",
  },
});

const logNamespace = io.of("/logs_connect"); // Creating a namespace for logs

// // Socket IO connection
logNamespace.on("connection", (socket: any) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

module.exports = { AppServer, io };
