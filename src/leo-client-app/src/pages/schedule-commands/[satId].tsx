"use client";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import Navbar from "@/components/navbar/Navbar";
import Scheduler from "@/components/Scheduler";
import { Stack } from "@mui/material";
import { useRouter } from "next/router";

function SchedulerPage() {
  const router = useRouter();
  let { satId } = router.query as {
    satId: string;
  };
  return (
    <main>
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={1}
        sx={{ width: "100%", backgroundColor: "var(--material-theme-black)"}}
      >
        <Navbar />
        <Scheduler />
      </Stack>
    </main>
  );
}

export default withPageAuthRequired(SchedulerPage);
