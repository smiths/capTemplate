"use client";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import Navbar from "@/components/navbar/Navbar";
import EditScheduler from "@/components/EditSchedules";
import { Box, Stack } from "@mui/material";
import { useRouter } from "next/router";
import SchedulerTerminal from "@/components/SchedulerTerminal";
import ExecuteScheduleCard from "@/components/ExecuteScheduleCard";

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
      <Stack sx={{ width: "100%" }} alignItems="center" p={2}>
        <Navbar />
        <ExecuteScheduleCard />
        <SchedulerTerminal />
      </Stack>
    </main>
  );
}

export default withPageAuthRequired(EditSchedulePage);
