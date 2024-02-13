"use client";

import { Box, CircularProgress, Stack } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import "../styles.css";

const fetchDelay = 1000;

interface SatelliteInfoState {
  positionEci: {
    x: number;
    y: number;
    z: number;
  };
  velocityEci: {
    x: number;
    y: number;
    z: number;
  };
  longitude: number;
  latitude: number;
  height: number;
  azimuth: number;
  elevation: number;
  rangeSat: number;
}

type Props = {
  noradId: string;
};

const SatelliteInfo = ({ noradId }: Props) => {
  const [state, setState] = useState<SatelliteInfoState>({
    positionEci: {
      x: 0,
      y: 0,
      z: 0,
    },
    velocityEci: {
      x: 0,
      y: 0,
      z: 0,
    },
    longitude: 0,
    latitude: 0,
    height: 0,
    azimuth: 0,
    elevation: -10,
    rangeSat: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3001/satellite/getSatelliteInfo",
        {
          params: { noradId: noradId },
        }
      );
      setState(res.data as SatelliteInfoState);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const runFetch = async () => {
      setIsLoading(true);
      await fetchData(); // Fetch data initially
      setIsLoading(false);
    };
    void runFetch();

    // Update data every 1000ms (1s)
    const dataFetchInterval = setInterval(fetchData, fetchDelay);

    return () => {
      // Clear the interval when the component is unmounted to prevent memory leaks
      clearInterval(dataFetchInterval);
    };
  }, [noradId]);

  const {
    positionEci,
    velocityEci,
    longitude,
    latitude,
    height,
    azimuth,
    elevation,
    rangeSat,
  } = state;

  return (
    <Stack alignItems="center" spacing={2}>
      <p className="material-themebodylarge">Satellite Information</p>
      {isLoading && (
        <Box
          sx={{
            width: "100%",
            minHeight: "200px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {!isLoading && (
        <Stack spacing={1}>
          <div>
            <strong>Position ECI:</strong>
            <ul>
              <li>X: {positionEci.x}</li>
              <li>Y: {positionEci.y}</li>
              <li>Z: {positionEci.z}</li>
            </ul>
          </div>
          <br />
          <div>
            <strong>Velocity ECI:</strong>
            <ul>
              <li>X: {velocityEci.x}</li>
              <li>Y: {velocityEci.y}</li>
              <li>Z: {velocityEci.z}</li>
            </ul>
          </div>
          <br />
          <div>
            <strong>Other Info:</strong>
            <ul>
              <li>Longitude: {longitude}</li>
              <li>Latitude: {latitude}</li>
              <li>Height: {height}</li>
              <br />
              <li>Azimuth: {azimuth}</li>
              <li>Elevation: {elevation}</li>
              <li>rangeSat: {rangeSat}</li>
            </ul>
          </div>
        </Stack>
      )}
    </Stack>
  );
};

export default SatelliteInfo;
