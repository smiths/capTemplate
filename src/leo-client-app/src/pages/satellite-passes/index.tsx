"use client";

import SatelliteInfo from "@/components/SatelliteInfo";
import FuturePasses from "@/components/FuturePasses";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";

function SatelliteInfoPage() {
  return (
    <main>
      <a href="/api/auth/logout">Logout</a>
      <SatelliteInfo />
      <FuturePasses />
    </main>
  );
}

export default withPageAuthRequired(SatelliteInfoPage);
