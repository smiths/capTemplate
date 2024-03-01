"use client";

import { Box, CircularProgress, Stack } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import "../styles.css";
import "./styles/satelliteInfo.css";
import "./styles/component.css";

type Props = {
  noradId: string;
};

const SatellitesOfInterest = ({ noradId }: Props) => {
  return (
    <div className="satellitesOfInterest">
      <Stack alignItems="flex-start" spacing={1}></Stack>
    </div>
  );
};

export default SatellitesOfInterest;
