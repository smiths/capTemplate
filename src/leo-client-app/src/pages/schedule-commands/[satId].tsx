"use client";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import Navbar from "@/components/navbar/Navbar";
import Scheduler from "@/components/Scheduler";
import { Stack } from "@mui/material";
import { useRouter } from "next/router";

function SchedulerPage() {
  const router = useRouter();
  let { satId, scheduleId } = router.query as {
    satId: string;
    scheduleId: string;
  };
  return (
    <main>
      <Stack
        alignItems="center"
        spacing={1}
        sx={{ width: "100%", minHeight: "100vh", backgroundColor: "var(--material-theme-black)"}}
      >
        <Navbar />
        <Scheduler />
      </Stack>
    </main>
  );
}

export default withPageAuthRequired(SchedulerPage);
