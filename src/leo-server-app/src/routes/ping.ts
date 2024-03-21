const messageHandler = require("../messageHandler"); // Import the module
const express = require("express");

const router = express.Router();
router.use(express.json());

router.get("", async (req: any, res: any) => {
  const sendMsg = await messageHandler.sendDataToClientAndAwaitResponse(
    "credits\n",
    5000
  );
  res.status(500).json({ output: sendMsg.toString() });
});
module.exports = router;
