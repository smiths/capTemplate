import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";

const defaultNoradId = "55098";

type Props = {
  userName: string;
};

const UserName = ({ userName }: Props) => {
  return (
    <Box
      className="material-themedisplaymedium"
      sx={{
        width: "100%",
        textAlign: "left",
        boxSizing: "border-box",
        position: "relative",
        color: "var(--material-theme-white)",
      }}
    >
      <span>{userName}&apos;s</span>
      <br />
      <span> saved satellites</span>
    </Box>
  );
};

export default UserName;
