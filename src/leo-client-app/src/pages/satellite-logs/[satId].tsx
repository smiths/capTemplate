"use client";

import Navbar from "@/components/navbar/Navbar";
import { useUser, withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import { Stack } from "@mui/material";
import Logs from "@/components/Logs";

function LogsPage() {
  const { user } = useUser();

  return (
    <main>
      <Stack sx={{ width: "100%", minHeight: "100vh", backgroundColor: "var(--material-theme-black)"}} alignItems="center" p={2}>
        <Navbar />
        <Logs />
      </Stack>
    </main>
  );
}

export default withPageAuthRequired(LogsPage);
