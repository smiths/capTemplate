"use client";

import SatelliteInfo from "@/components/SatelliteInfo";
import FuturePasses from "@/components/FuturePasses";
import UpcomingSchedules from "@/components/UpcomingSchedules";
import SatelliteTLE from "@/components/SatelliteTLE";
import SatelliteName from "@/components/SatelliteName";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import { Stack, Box } from "@mui/material";
import Navbar from "@/components/navbar/Navbar";
import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import axios from "axios";
import "../../styles.css";
import { useRouter } from "next/router";
import { BACKEND_URL } from "@/constants/api";

const defaultNoradId = "55098";

function SatelliteInfoPage() {
  const router = useRouter();
  const { satId } = router.query;

  const [selectedNoradId, setSelectedNoradId] =
    useState<string>(defaultNoradId);
  const [satelliteName, setSatelliteName] = useState<string>();

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/satellite/getSatellite`, {
        params: { satelliteId: satId },
      });
      setSatelliteName(res.data.satellite.name);
      setSelectedNoradId(res.data.satellite.noradId);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const runFetch = async () => {
      await fetchData(); // Fetch data initially
    };
    void runFetch();
  }, [selectedNoradId]);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={1}
      sx={{ minHeight: "100vh", margin: "0 auto", width: "100%", backgroundColor: "var(--material-theme-black)"}}
    >
      <Navbar />
      <Grid
        container
        spacing={2}
        sx={{
          alignItems: "flex-start",
          maxWidth: "1280px",
          boxSizing: "border-box",
          justifyContent: "center",
          mx: "auto",
        }}
      >
        <SatelliteName satelliteName={satelliteName as string} />
        <Grid
          container
          spacing={3}
          sx={{
            justifyContent: "space-between",
            alignItems: "flex-start",
            height: "auto",
            maxWidth: "1280px",
            boxSizing: "border-box",
          }}
        >
          <Grid item xs={14} lg={10} sx={{boxSizing: "border-box" }}>
            <Stack spacing={3} sx={{ boxSizing: "border-box" }}>
              <Box>
                <UpcomingSchedules noradId={selectedNoradId} />
              </Box>
              <Box>
                <FuturePasses noradId={selectedNoradId} />
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} lg={2} sx={{ boxSizing: "border-box" }}>
            <SatelliteInfo noradId={selectedNoradId} />
          </Grid>
        </Grid>
      </Grid>
    </Stack>
  );
}

export default withPageAuthRequired(SatelliteInfoPage);
