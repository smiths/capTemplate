"use client";

import all from "@/components/Scheduler";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import { Stack } from "@mui/material";
import Navbar from "@/components/navbar/Navbar";
import { useNavigate } from 'react-router-dom';
import SchedulesPage from "@/components/Scheduler";


function SchedulerPage() {

  // let navigate = useNavigate();

  //     const handleEditClick = () => {
  //       navigate('/edit-schedules/index.tsx');
  //     };
  return (
    <main>
      <Navbar />
      <SchedulesPage />


      
    {/*<Stack spacing={3} alignItems="center" p={2}>
      </Stack>*/}
    </main>
  );
}



export default withPageAuthRequired(SchedulerPage);