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
      <Stack sx={{ width: "100%", backgroundColor: "var(--material-theme-black)" }} alignItems="center" p={2}>
        <Navbar />
        <EditScheduler />
      </Stack>
    </main>
  );
}

export default withPageAuthRequired(EditSchedulePage);
