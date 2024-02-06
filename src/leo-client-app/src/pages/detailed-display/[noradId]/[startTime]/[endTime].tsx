"use client";

import DetailedDisplay from "@/components/DetailedDisplay";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/router";
import { Stack } from "@mui/material";
import Navbar from "@/components/navbar/Navbar";

function DetailedSatelliteInfoPage() {
  const router = useRouter();
  const { noradId, startTime, endTime } = router.query;

  return (
    <main>
      <Navbar />
      <Stack spacing={3} alignItems="center" p={2}>
        <DetailedDisplay
          noradId={noradId?.toString() ?? ""}
          startTime={startTime?.toString() ?? ""}
          endTime={endTime?.toString() ?? ""}
        />
      </Stack>
    </main>
  );
}

export default withPageAuthRequired(DetailedSatelliteInfoPage);
