"use client";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import Navbar from "@/components/navbar/Navbar";
import EditScheduler from "@/components/EditSchedules";
import { Stack } from "@mui/material";
import { useRouter } from "next/router";

type Props = {
  noradId: string;
  scheduleId: string;
};

function EditSchedulePage() {
  const router = useRouter();
  const { satId, scheduleId } = router.query as {
    satId: string;
    scheduleId: string;
  };
  return (
    <main>
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={1}
        sx={{ width: "100%" }}
      >
        <Navbar />
        <EditScheduler />
      </Stack>
    </main>
  );
}

export default withPageAuthRequired(EditSchedulePage);
