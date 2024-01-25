"use client";

import SatelliteInfo from "@/components/SatelliteInfo";
import FuturePasses from "@/components/FuturePasses";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import { Stack } from "@mui/material";
import Navbar from "@/components/navbar/Navbar";
import SatelliteTLE from "@/components/SatelliteTLE";
import React, { useState } from "react";

function SatelliteInfoPage() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <main>
      <Navbar />
      <Stack spacing={3} alignItems="center" p={2}>
        <SatelliteTLE />
        <SatelliteInfo />
        <FuturePasses />
      </Stack>
    </main>
  );
}

export default withPageAuthRequired(SatelliteInfoPage);
