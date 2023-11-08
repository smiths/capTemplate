"use client";

import Image from "next/image";
// import styles from "./page.module.css";
import SatelliteInfo from "@/components/SatelliteInfo";
import FuturePasses from "@/components/FuturePasses";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";

function SatelliteInfoPage() {
  return (
    <main>
      <a href="/api/auth/login">Login</a>

      <SatelliteInfo />
      <FuturePasses />
    </main>
  );
}

export default withPageAuthRequired(SatelliteInfoPage);
