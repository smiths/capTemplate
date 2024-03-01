"use client";

import { Card, CardContent, Grid, Stack } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import "../styles.css";
import "./styles/satellitesOfInterest.css";
import "./styles/component.css";
import UserName from "./UserName";

type Props = {
  userId: string;
};

const SatellitesOfInterest = ({ userId }: Props) => {
  const [satellites, setSatellites] = useState<string[]>([]);

  const fetchSatelliteName = async (satelliteId: string) => {
    try {
      const response = await axios.get(
        "http://localhost:3001/satellite/getSatellite",
        {
          params: { satelliteId: satelliteId },
        }
      );
      // Return just the name of the satellite instead of the whole object
      return response.data.satellite.name;
    } catch (error) {
      console.error("Error fetching satellite name:", error);
      return "";
    }
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3001/users/getUserSatellites",
        {
          params: { userId: userId },
        }
      );
      const satelliteIds = res.data.satellitesOfInterest;
      const satelliteNamesPromises = satelliteIds.map((satelliteId: string) =>
        fetchSatelliteName(satelliteId)
      );
      const satelliteNames = await Promise.all(satelliteNamesPromises);
      setSatellites(satelliteNames);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="satellitesOfInterest">
      <Stack alignItems="flex-start" spacing={1}>
        <UserName userName="65a5e14ee0d601e0e8c4a387" />
        <p className="headerBox">Saved Satellites</p>
        <Stack
          className="satellitesOfInterestBox"
          alignItems="flex-start"
          direction="row"
          spacing={5}
        >
          {satellites.map((satelliteName, index) => (
            <Grid item key={index} spacing={1}>
              <Card
                sx={{
                  minWidth: 150,
                  maxWidth: 150,
                  margin: 0.5,
                  backgroundColor:
                    "var(--material-theme-sys-light-inverse-on-surface)",
                  cursor: "pointer",
                  borderRadius: 3,
                  minHeight: 150,
                  maxHeight: 150,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 2,
                  marginRight: 2,
                }}
              >
                <CardContent>
                  <p className="cardTitle">{satelliteName}</p>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Stack>
      </Stack>
    </div>
  );
};

export default SatellitesOfInterest;
