import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React, { useEffect, useState } from "react";

interface Pass {
  type: string;
  time: string;
  azimuth: number;
  elevation: number;
}

const FuturePasses: React.FC = () => {
  const [passes, setPasses] = useState<Pass[][]>([]);
  const { user } = useUser();

  const fetchPasses = () => {
    fetch("http://localhost:3001/getNextPasses")
      .then((response) => {
        if (!response.ok) {
          throw Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setPasses(data.nextPasses);
      })
      .catch((error) => {
        console.error("Error fetching passes:", error);
      });
  };

  useEffect(() => {
    fetchPasses(); // Fetch passes initially

    // Update passes every 1000ms (1s)
    // TODO: Change to a week for refreshes
    const passesFetchInterval = setInterval(fetchPasses, 1000);

    return () => {
      clearInterval(passesFetchInterval); // Clear the interval when unmounting
    };
  }, []);

  return (
    <Stack alignItems="center" spacing={2}>
      <h1>Next Week's Passes</h1>
      <TableContainer
        component={Paper}
        sx={{ maxWidth: 650, background: "#40403fb0" }}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "white !important" }} align="center">
                Entry
              </TableCell>
              <TableCell sx={{ color: "white !important" }} align="center">
                Exit
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {passes.map((passPair, index) => (
              <TableRow
                key={passPair[0].time + index}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell
                  sx={{ color: "white !important" }}
                  align="center"
                  component="th"
                  scope="row">
                  {passPair[0].type === "Enter" && <>{passPair[0].time}</>}
                </TableCell>
                <TableCell sx={{ color: "white !important" }} align="center">
                  {passPair[1].type === "Exit" && <>{passPair[1].time}</>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default FuturePasses;
