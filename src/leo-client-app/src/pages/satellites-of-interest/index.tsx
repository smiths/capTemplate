"use client";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import Navbar from "@/components/navbar/Navbar";
import SatellitesOfInterest from "@/components/SatellitesOfInterest";
import { Grid, Stack } from "@mui/material";

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
          <SatellitesOfInterest userId="65a5e14ee0d601e0e8c4a387" />
        </Grid>
      </Stack>
    </main>
  );
}

export default withPageAuthRequired(SatellitesOfInterestPage);
