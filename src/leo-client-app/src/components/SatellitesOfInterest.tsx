"use client";

import { Card, CardContent, Grid, Stack } from "@mui/material";
import Link from "next/link";
import axios from "axios";
import React, { useEffect, useState } from "react";
import "../styles.css";
import "./styles/satellitesOfInterest.css";
import "./styles/component.css";
import UserName from "./UserName";

type Props = {
  userId: string;
};

type SatelliteDetails = {
  name: string;
  noradId: string;
};

const SatellitesOfInterest = ({ userId }: Props) => {
  const [satellites, setSatellites] = useState<SatelliteDetails[]>([]);

  const fetchSatellites = async (satelliteId: string) => {
    try {
      const response = await axios.get(
        "http://localhost:3001/satellite/getSatellite",
        {
          params: { satelliteId: satelliteId },
        }
      );

      return {
        name: response.data.satellite.name,
        noradId: response.data.satellite.noradId,
      };
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
        fetchSatellites(satelliteId)
      );
      const satellites = await Promise.all(satelliteNamesPromises);
      setSatellites(satellites);
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
          {satellites.map((satellite, index) => (
            <Grid item key={index} spacing={1}>
              <Link href={`/satellite/${satellite.noradId}`} passHref>
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
                    <p className="cardTitle">{satellite.name}</p>
                    <p className="cardSubtitle">{satellite.noradId}</p>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Stack>
      </Stack>
    </div>
  );
};

export default SatellitesOfInterest;
