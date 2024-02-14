"use client";

import { Stack, TextField, Button } from "@mui/material";
import React, { useState } from "react";

type Props = {
  noradId: string;
  setNoradId: any;
};

const SatelliteTLE = ({ noradId, setNoradId }: Props) => {
  const [inputValue, setInputValue] = useState(noradId);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = () => {
    setNoradId(inputValue);
  };

  return (
    <div>
      <Stack alignItems="center" spacing={2}>
        <Stack spacing={1}>
          <div>
            <TextField
              variant="outlined"
              value={inputValue}
              onChange={handleChange}
              style={{ backgroundColor: "white" }}
            />
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        </Stack>
      </Stack>
    </div>
  );
};

export default SatelliteTLE;
