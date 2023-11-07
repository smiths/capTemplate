"use client";

import Image from "next/image";
// import styles from "./page.module.css";
import SatelliteInfo from "@/components/SatelliteInfo";
import FuturePasses from "@/components/FuturePasses";

export default function Home() {
  return (
    <main>
      <a href="/api/auth/login">Login</a>

      <SatelliteInfo />
      <FuturePasses />
    </main>
  );
}
