"use client";

import { Stack, TextField, Button } from "@mui/material";
import React, { useState } from "react";
import axios from "axios";

const SatelliteTLE: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [submittedValue, setSubmittedValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3001/satellite/changeTLE",
        {
          noradID: inputValue,
        }
      );
    } catch (error) {
      console.error("Error submitting TLE:", error);
    } finally {
      setIsLoading(false);
    }
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
            {submittedValue && <div>Submitted Value: {submittedValue}</div>}
          </div>
        </Stack>
      </Stack>
      {isLoading && <p>loading new TLE</p>}
    </div>
  );
};

export default SatelliteTLE;
