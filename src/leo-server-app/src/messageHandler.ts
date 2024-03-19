import { WebSocket } from "ws";

let clientSocket: any = null; // This will hold the active WebSocket connection

// Function to set the client socket
function setClientSocket(socket: any) {
  clientSocket = socket;
}

// Send data to the client and wait for the response
function sendDataToClientAndAwaitResponse(dataToSend: any, timeout: number) {
  return new Promise((resolve, reject) => {
    let responseData = "";

    // Timeout period when reading response data line by line
    let fragmentTimeout: any = null;
    const fragmentTimeoutDuration = 1000;

    if (!clientSocket || clientSocket.readyState !== WebSocket.OPEN) {
      resolve("WebSocket connection is not open");
      return;
    }

    // Create a timeout to reject the promise if no response is received within the specified period
    const timeoutId = setTimeout(() => {
      resolve("Response timeout");
    }, timeout);

    // Listen for a message from the client
    clientSocket.on("message", function message(data: any) {
      clearTimeout(timeoutId);
      clearTimeout(fragmentTimeout);

      timeout = 1000;
      responseData += data.toString();

      // Return data if no new message in the next second
      fragmentTimeout = setTimeout(() => {
        resolve(responseData);
      }, fragmentTimeoutDuration);
    });

    // Send data to the client
    clientSocket.send(dataToSend);
  });
}

module.exports = { setClientSocket, sendDataToClientAndAwaitResponse };
