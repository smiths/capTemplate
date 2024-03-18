import * as https from "https";
import * as WebSocket from "ws";

const messageHandler = require("./messageHandler"); // Import the module

const SocketServer = https.createServer({
  cert: process.env.SOCKET_CERT,
  key: process.env.SOCKET_KEY,
});

const wss = new WebSocket.Server({ server: SocketServer });

wss.on("connection", function connection(ws: any) {
  console.log("----------------------------------------");
  console.log(`Client connected`);
  console.log("----------------------------------------");
  messageHandler.setClientSocket(ws);

  ws.on("message", function message(data: any) {
    console.log(`${data}`);
  });

  ws.on("close", function close() {
    console.log("Client disconnected");
  });
});

module.exports = SocketServer;
