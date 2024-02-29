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
import { BACKEND_URL } from "@/constants/api";

const defaultNoradId = "55098";

function SatelliteInfoPage() {
  const [selectedNoradId, setSelectedNoradId] =
    useState<string>(defaultNoradId);
  const [satelliteName, setSatelliteName] = useState<string>();

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/satellite/getSatelliteName`, {
        params: { noradId: selectedNoradId },
      });
      setSatelliteName(res.data);
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

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={1}
      sx={{ height: "100vh", margin: "0 auto", width: "100%" }}>
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
        }}>
        <SatelliteName noradId={selectedNoradId} />
        <Grid
          container
          spacing={3}
          sx={{
            justifyContent: "space-between",
            alignItems: "flex-start",
            height: "auto",
            maxWidth: "1280px",
            boxSizing: "border-box",
          }}>
          <Grid item xs={14} lg={10} sx={{ boxSizing: "border-box" }}>
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

      <SatelliteTLE noradId={selectedNoradId} setNoradId={setSelectedNoradId} />
    </Stack>
  );
}

export default withPageAuthRequired(SatelliteInfoPage);
