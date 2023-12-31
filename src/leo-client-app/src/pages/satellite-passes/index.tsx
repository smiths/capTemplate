"use client";

import SatelliteInfo from "@/components/SatelliteInfo";
import FuturePasses from "@/components/FuturePasses";
import DetailedDisplay from "@/components/DetailedDisplay";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import { Stack } from "@mui/material";
import Navbar from "@/components/navbar/Navbar";

function SatelliteInfoPage() {
  return (
    <main>
      <Navbar />
      <Stack spacing={3} alignItems="center" p={2}>
        <SatelliteInfo />
        <DetailedDisplay />
        <FuturePasses />
      </Stack>
    </main>
  );
}

export default withPageAuthRequired(SatelliteInfoPage);
