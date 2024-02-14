"use client";

import SatelliteInfo from "@/components/SatelliteInfo";
import FuturePasses from "@/components/FuturePasses";
import UpcomingSchedules from "@/components/UpcomingSchedules";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import { Stack } from "@mui/material";
import Navbar from "@/components/navbar/Navbar";
import SatelliteTLE from "@/components/SatelliteTLE";
import React, { useState } from "react";
import { Grid } from "@mui/material";

const defaultNoradId = "55098";

function SatelliteInfoPage() {
  const [isLoading, setIsLoading] = useState(false);

  const [selectedNoradId, setSelectedNoradId] =
    useState<string>(defaultNoradId);

  return (
    <main>
      <Navbar />
      <Grid
        container
        spacing={3}
        alignItems="start"
        justifyContent="center"
        p={2}
      >
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* <SatelliteTLE
              noradId={selectedNoradId}
              setNoradId={setSelectedNoradId}
            /> */}
            <UpcomingSchedules noradId={selectedNoradId} />
            <FuturePasses noradId={selectedNoradId} />
          </Stack>
        </Grid>
        <Grid item xs={12} md={4}>
          <SatelliteInfo noradId={selectedNoradId} />
        </Grid>
      </Grid>
    </main>
  );
}

export default withPageAuthRequired(SatelliteInfoPage);
