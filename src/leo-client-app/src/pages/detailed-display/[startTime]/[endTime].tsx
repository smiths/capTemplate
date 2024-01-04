"use client";

import DetailedDisplay from "@/components/DetailedDisplay";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/router";
import { Stack } from "@mui/material";
import Navbar from "@/components/navbar/Navbar";

function DetailedSatelliteInfoPage() {
  const router = useRouter();
  const { startTime, endTime } = router.query;

  return (
    <main>
      <Navbar />
      <Stack spacing={3} alignItems="center" p={2}>
        <DetailedDisplay
          startTime={startTime as string}
          endTime={endTime as string}
        />
      </Stack>
    </main>
  );
}

export default withPageAuthRequired(DetailedSatelliteInfoPage);
