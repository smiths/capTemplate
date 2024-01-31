"use client";

import Scheduler from "@/components/Scheduler";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import { Stack } from "@mui/material";
import Navbar from "@/components/navbar/Navbar";
import EditSchedule_Page from "@/components/EditSchedules";

function EditSchedulePage() {

  return (
    <main>
      <Navbar />
      <EditSchedule_Page />

    {/*<Stack spacing={3} alignItems="center" p={2}>
      </Stack>*/}
    </main>
  );
}

export default withPageAuthRequired(EditSchedulePage);