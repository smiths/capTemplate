"use client";

import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import Navbar from "@/components/navbar/Navbar";
import "../../styles.css";
import { Stack } from "@mui/material";
import SatelliteCommands from "@/components/SatelliteCommands";

function SatelliteCommandsPage() {
  return (
    <main>
      <Stack
        sx={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "var(--material-theme-black)",
        }}
        alignItems="center"
        p={2}
      >
        <Navbar />
        <SatelliteCommands />
      </Stack>
    </main>
  );
}

export default withPageAuthRequired(SatelliteCommandsPage);
