"use client";

import SatelliteInfo from "@/components/SatelliteInfo";
import FuturePasses from "@/components/FuturePasses";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import { Stack, Box } from "@mui/material";
import Navbar from "@/components/navbar/Navbar";
import React, { useState } from "react";
import { Grid } from "@mui/material";

const defaultNoradId = "55098";

function SatelliteInfoPage() {
  const [isLoading, setIsLoading] = useState(false);

  const [selectedNoradId, setSelectedNoradId] =
    useState<string>(defaultNoradId);

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={1}
      sx={{ height: "100vh", margin: "0 auto", width: "100%" }}
    >
      <Navbar />
      <Grid
        container
        spacing={3}
        sx={{
          justifyContent: "center",
          alignItems: "flex-start",
          height: "calc(100% - 64px)",
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>
            <Box>
              {/* Your Schedule Queue goes here */}
              <UpcomingSchedules noradId={selectedNoradId} />
            </Box>
            <Box>
              {/* Your Next Week's Passes goes here */}
              <FuturePasses noradId={selectedNoradId} />
            </Box>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4}>
          {/* Your Satellite Information goes here */}
          <SatelliteInfo noradId={selectedNoradId} />
        </Grid>
      </Grid>
    </Stack>
  );
}

export default withPageAuthRequired(SatelliteInfoPage);
