const express = require("express");

import SatelliteUser from "../models/satelliteUser";
import mongoose from "mongoose";

const router = express.Router();
router.use(express.json());

type CreateUser = {
    query: {
        satelliteId: string;
        adminId: string;
        userId: string;
        validCommands: Set<String>;
    }
}



module.exports = router;
