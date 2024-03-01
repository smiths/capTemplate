"use client";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import Navbar from "@/components/navbar/Navbar";
import SatellitesOfInterest from "@/components/SatellitesOfInterest";
import { Stack } from "@mui/material";

function SatellitesOfInterestPage() {
  return (
    <main>
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={1}
        sx={{ width: "100%" }}
      >
        <Navbar />
        <SatellitesOfInterest noradId="55098" />
      </Stack>
    </main>
  );
}

export default withPageAuthRequired(SatellitesOfInterestPage);
