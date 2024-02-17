"use client";

import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import Navbar from "@/components/navbar/Navbar";

import Scheduler from "@/components/Scheduler";


function SchedulerPage() {
  return (
    <main>
      <Navbar />
      <Scheduler />
    </main>
  );
}



export default withPageAuthRequired(SchedulerPage);