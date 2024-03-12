import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";

const defaultNoradId = "55098";

type Props = {
  satelliteName: string;
};

const SatelliteName = ({ satelliteName }: Props) => {
  return (
    <Box
      className="material-themedisplaymedium"
      sx={{
        color: "white",
        width: "100%",
        textAlign: "left",
        boxSizing: "border-box",
        marginTop: "50px",
      }}
    >
      {satelliteName}
    </Box>
  );
};

export default SatelliteName;
