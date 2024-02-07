import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Box,
  CircularProgress,
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
import axios from "axios";

interface Pass {
  type: string;
  time: string;
  azimuth: number;
  elevation: number;
}

type Props = {
  noradId: string;
};

const FuturePasses = ({ noradId }: Props) => {
  const [passes, setPasses] = useState<Pass[][]>([]);
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  function formatDateToISO(dateString: string) {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 19) + "Z";
  }

  const fetchPasses = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3001/satellite/getNextPasses",
        {
          params: { noradId: noradId },
        }
      );
      setPasses(res.data?.nextPasses ?? []);
    } catch (error) {
      console.error("Error fetching passes:", error);
    }
  };

  useEffect(() => {
    const runFetch = async () => {
      setIsLoading(true);
      await fetchPasses(); // Fetch data initially
      setIsLoading(false);
    };
    void runFetch();
    // Update passes every 1000ms (1s)
    // TODO: Change to a week for refreshes
    const passesFetchInterval = setInterval(fetchPasses, 1000);

    return () => {
      clearInterval(passesFetchInterval); // Clear the interval when unmounting
    };
  }, [noradId]);

  return (
    <Stack alignItems="center" spacing={2}>
      <h1>Next Week&apos;s Passes</h1>
      {isLoading && (
        <Box
          sx={{
            width: "100%",
            minHeight: "200px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}>
          <CircularProgress />
        </Box>
      )}
      {!isLoading && (
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
                <TableCell sx={{ color: "white !important" }} align="center">
                  More Info
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {passes &&
                passes?.map((passPair, index) => (
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
                    <TableCell
                      sx={{ color: "white !important" }}
                      align="center">
                      {passPair[1].type === "Exit" && <>{passPair[1].time}</>}
                    </TableCell>
                    <TableCell sx={{ color: "white !important" }}>
                      <NextLink
                        href={`/detailed-display/${noradId}/${encodeURIComponent(
                          formatDateToISO(passPair[0].time)
                        )}/${encodeURIComponent(
                          formatDateToISO(passPair[1].time)
                        )}`}>
                        <u>View Details</u>
                      </NextLink>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
};

export default FuturePasses;
