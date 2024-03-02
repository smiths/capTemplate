import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/constants/api";

const defaultNoradId = "55098";

type Props = {
  noradId: string;
};

const SatelliteName = ({ noradId }: Props) => {
  const [selectedNoradId, setSelectedNoradId] =
    useState<string>(defaultNoradId);
  const [satelliteName, setSatelliteName] = useState<string>("BDSAT-2");

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/satellite/getSatelliteName`, {
        params: { noradId: selectedNoradId },
      });
      setSatelliteName(res.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Effect to fetch data when selectedNoradId changes
  useEffect(() => {
    fetchData(); // Fetch data initially
  }, [selectedNoradId]);

  // Effect to update selectedNoradId when noradId prop changes
  useEffect(() => {
    setSelectedNoradId(noradId);
  }, [noradId]);

  return (
    <Box
      className="material-themedisplaymedium"
      sx={{
        width: "100%",
        textAlign: "left",
        boxSizing: "border-box",
        marginTop: "50px",
      }}>
      {satelliteName}
    </Box>
  );
};

export default SatelliteName;
