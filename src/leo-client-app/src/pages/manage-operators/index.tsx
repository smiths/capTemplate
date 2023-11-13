"use client";

import Navbar from "@/components/navbar/Navbar";
import OperatorList from "@/components/operator-management/OperatorList";
import { useUser, withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import { Stack } from "@mui/material";

function MangeOperatorsPage() {
  const { user } = useUser();

  return (
    <main>
      <Navbar />
      <Stack sx={{ width: "100%" }} alignItems="center" p={2}>
        <OperatorList />
      </Stack>
    </main>
  );
}

export default withPageAuthRequired(MangeOperatorsPage);
