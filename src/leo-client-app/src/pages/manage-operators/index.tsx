"use client";

import Navbar from "@/components/navbar/Navbar";
import OperatorList from "@/components/operator-management/OperatorList";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import { Stack } from "@mui/material";

function MangeOperatorsPage() {
  return (
    <main>
      <Stack sx={{ width: "100%", minHeight: "100vh", backgroundColor: "var(--material-theme-black)"}} alignItems="center" p={2}>
        <Navbar />
        <OperatorList />
      </Stack>
    </main>
  );
}

export default withPageAuthRequired(MangeOperatorsPage);
