"use client";

import { Box, CircularProgress, Stack } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import "../styles.css";
import "./styles/satelliteInfo.css";
import "./styles/component.css";

type Props = {
  userId: string;
};

const SatellitesOfInterest = ({ userId }: Props) => {
  const [satellites, setSatellites] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3001/users/getUserSatellites",
        {
          params: { userId: "65a5e14ee0d601e0e8c4a387" },
        }
      );
      console.log(res.data);
      setSatellites(res.data.satellitesOfInterest);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log("sats");
    console.log(satellites);
  }, [satellites]);

  return (
    <div className="satellitesOfInterest">
      <Stack alignItems="flex-start" spacing={1}></Stack>
    </div>
  );
};

export default SatellitesOfInterest;
