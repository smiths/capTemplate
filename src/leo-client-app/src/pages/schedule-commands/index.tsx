"use client";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import Navbar from "@/components/navbar/Navbar";
import Scheduler from "@/components/Scheduler";
import { Stack } from "@mui/material";



function SchedulerPage() {
  return (
    <main>
      <Stack
      alignItems="center"
      justifyContent="center"
      spacing={1}
      sx={{ width: "100%" }}> 

      <Navbar />
      <Scheduler noradId="55098"/>
      </Stack>
    </main>
  );
}



export default withPageAuthRequired(SchedulerPage);