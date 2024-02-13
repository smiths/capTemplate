"use client";

import { Box, CircularProgress, Stack } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import "../styles.css";
import "./styles/satelliteInfo.css";
import "./styles/component.css";

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
    <div className="satelliteInfo">
      <Stack alignItems="flex-start" spacing={1}>
        <p className="headerBox">Satellite Information</p>
        {isLoading && (
          <Box className="loadingBox">
            <CircularProgress />
          </Box>
        )}
        {!isLoading && (
          <Stack className="contentBox" spacing={0}>
            <div className="material-themebodylarge">
              Position ECI:
              <ul className="inner-list">
                <li>X: {positionEci.x.toFixed(2)}</li>
                <li>Y: {positionEci.y.toFixed(2)}</li>
                <li>Z: {positionEci.z.toFixed(2)}</li>
              </ul>
            </div>
            <br />
            <div>
              Velocity ECI:
              <ul className="inner-list">
                <li>X: {velocityEci.x.toFixed(2)}</li>
                <li>Y: {velocityEci.y.toFixed(2)}</li>
                <li>Z: {velocityEci.z.toFixed(2)}</li>
              </ul>
            </div>
            <br />
            <div>
              Geodetic Info:
              <ul className="inner-list">
                <li>Longitude: {longitude.toFixed(2)}</li>
                <li>Latitude: {latitude.toFixed(2)}</li>
                <li>Height: {height.toFixed(2)}</li>
              </ul>
            </div>
            <br />
            <div>
              Other Info:
              <ul className="inner-list">
                <li>Azimuth: {azimuth.toFixed(2)}</li>
                <li>Elevation: {elevation.toFixed(2)}</li>
                <li>rangeSat: {rangeSat.toFixed(2)}</li>
              </ul>
            </div>
          </Stack>
        )}
      </Stack>
    </div>
  );
};

export default SatelliteInfo;
