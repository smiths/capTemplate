import * as readline from "readline";
import * as https from "https";
import * as WebSocket from "ws";

const app = require("./app");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const server = https.createServer({
  cert: process.env.SOCKET_CERT,
  key: process.env.SOCKET_KEY,
});

const wss = new WebSocket.Server({ server });

// Also mount the app here
server.on("request", app);

wss.on("connection", function connection(ws: any) {
  console.log("----------------------------------------");
  console.log(`Client connected`);
  console.log("----------------------------------------");

  ws.on("message", function message(data: any) {
    console.log(`${data}`);
  });

  ws.on("close", function close() {
    console.log("Client disconnected");
  });

  rl.on("line", (input) => {
    const commandToSend = input.trim() + "\n";
    ws.send(commandToSend);
    if (input.trim().toLowerCase() === "exit") {
      rl.close();
      ws.close();
    }
  });
});

module.exports = server;
