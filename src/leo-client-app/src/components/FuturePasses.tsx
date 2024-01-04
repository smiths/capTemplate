import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Link,
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
import NextLink from "next/link";

interface Pass {
  type: string;
  time: string;
  azimuth: number;
  elevation: number;
}

const FuturePasses: React.FC = () => {
  const [passes, setPasses] = useState<Pass[][]>([]);
  const { user } = useUser();

  function formatDateToISO(dateString: string) {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 19) + "Z";
  }

  const fetchPasses = () => {
    fetch("http://localhost:3001/satellite/getNextPasses")
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
      <h1>Next Week&apos;s Passes</h1>
      <TableContainer
        component={Paper}
        sx={{ maxWidth: 650, background: "#40403fb0" }}
      >
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "white !important" }} align="center">
                Entry
              </TableCell>
              <TableCell sx={{ color: "white !important" }} align="center">
                Exit
              </TableCell>
              <TableCell sx={{ color: "white !important" }} align="center">
                More Info
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {passes.map((passPair, index) => (
              <TableRow
                key={passPair[0].time + index}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell
                  sx={{ color: "white !important" }}
                  align="center"
                  component="th"
                  scope="row"
                >
                  {passPair[0].type === "Enter" && <>{passPair[0].time}</>}
                </TableCell>
                <TableCell sx={{ color: "white !important" }} align="center">
                  {passPair[1].type === "Exit" && <>{passPair[1].time}</>}
                </TableCell>
                <TableCell sx={{ color: "white !important" }}>
                  <NextLink
                    href={`/detailed-display/${encodeURIComponent(
                      formatDateToISO(passPair[0].time)
                    )}/${encodeURIComponent(
                      formatDateToISO(passPair[1].time)
                    )}`}
                  >
                    <u>View Details</u>
                  </NextLink>
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
