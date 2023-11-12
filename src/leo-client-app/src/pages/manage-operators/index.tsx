"use client";

import Navbar from "@/components/navbar/Navbar";
import OperatorList from "@/components/operator-management/OperatorList";
import { useUser, withPageAuthRequired } from "@auth0/nextjs-auth0/client";

function MangeOperatorsPage() {
  const { user } = useUser();

  return (
    <main>
      <Navbar />
      <OperatorList />
    </main>
  );
}

export default withPageAuthRequired(MangeOperatorsPage);
