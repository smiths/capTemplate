import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";

const defaultNoradId = "55098";

type Props = {

const SatelliteName = ({ satelliteName }: Props) => {
  return (
    <Box
      className="material-themedisplaymedium"
      sx={{
        width: "100%",
        textAlign: "left",
        boxSizing: "border-box",
        marginTop: "50px",
      }}
    >
      {name}
    </Box>
  );
};

export default SatelliteName;
