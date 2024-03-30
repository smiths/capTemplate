"use client";

import React, { useEffect, useState } from "react";
import "../styles.css";
import { BACKEND_URL } from "@/constants/api";
import { useRouter } from "next/router";
import axios from "axios";
import SatelliteName from "./SatelliteName";

const SatelliteCommands: React.FC = () => {
  const router = useRouter();
  const satId = router.query?.satId?.toString() ?? "655acd63d122507055d3d2ea";
  const [satelliteName, setSatelliteName] = useState<string>();
  const [validCommands, setValidCommands] = useState([]);

  const fetchName= async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/satellite/getSatellite`, {
        params: { satelliteId: satId },
      });
      setSatelliteName(res.data.satellite.name);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchValidCommands = async (satId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/satellite/getSatellite?satelliteId=${satId}`);
      const data = await response.json();
      setValidCommands(data.satellite.validCommands);
    } catch (error) {
      console.error("Error fetching valid commands Admin:", error);
    }
  };

  useEffect(() => {
    fetchName();
    fetchValidCommands(satId);
  }, []);

  return (
    <div>
      <SatelliteName satelliteName={satelliteName as string} />
      <h1>Satellite Commands</h1>
      <ul>
        {validCommands.map((command, index) => (
          <li key={index}>{command}</li>
        ))}
      </ul>
    </div>
  );
};

export default SatelliteCommands;
