import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
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
import "../styles.css";
import "./styles/component.css";
import "./styles/futurePasses.css";
import { BACKEND_URL } from "@/constants/api";

interface Pass {
  type: string;
  time: string;
  azimuth: number;
  elevation: number;
}

type Props = {
  noradId: string;
};

// Helper functions to format date and time
function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
}

function formatTimeRange(startTime: string, endTime: string) {
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  const startHours = startDate.getHours();
  const startMinutes = startDate.getMinutes().toString().padStart(2, "0");
  const endHours = endDate.getHours();
  const endMinutes = endDate.getMinutes().toString().padStart(2, "0");

  const formattedStartTime = startHours + ":" + startMinutes;
  const formattedEndTime = endHours + ":" + endMinutes;

  return `${formattedStartTime} - ${formattedEndTime}`;
}

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
      const res = await axios.get(`${BACKEND_URL}/satellite/getNextPasses`, {
        params: { noradId: noradId },
      });
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
    <div className="futurePasses">
      <Stack alignItems="flex-start" spacing={1}>
        <p className="headerBox">Next Week&apos;s Passes</p>
        <div className="futurePassesBox">
          {isLoading ? (
            <Box className="loadingBox">
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              style={{ width: "100%" }}
              sx={{
                maxWidth: "100%",
                background: "var(--material-theme-sys-light-primary-fixed)",
                "& .MuiTableCell-root": {
                  borderBottom: "2px solid black",
                  color: "var(--material-theme-black)",
                  textAlign: "left",
                  fontSize: "15px",
                },
              }}
            >
              <Table
                sx={{
                  border:
                    "2px solid var(--material-theme-sys-light-on-primary)",
                  borderRadius: "15px",
                }}
                stickyHeader
                aria-label="simple table"
              >
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor:
                        "var(--material-theme-sys-light-primary-fixed)",
                      "& .MuiTableCell-head": {
                        backgroundColor:
                          "var(--material-theme-sys-light-primary-fixed) !important",
                      },
                    }}
                  >
                    <TableCell>Date</TableCell>
                    <TableCell>Time Range</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {passes &&
                    passes.map((passPair, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          (window.location.href = `/detailed-display/${noradId}/${encodeURIComponent(
                            formatDateToISO(passPair[0].time)
                          )}/${encodeURIComponent(
                            formatDateToISO(passPair[1].time)
                          )}`)
                        }
                      >
                        <TableCell component="th" scope="row">
                          {formatDate(passPair[0].time)}
                        </TableCell>
                        <TableCell>
                          {formatTimeRange(passPair[0].time, passPair[1].time)}
                        </TableCell>
                        <TableCell>View Details</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>
      </Stack>
    </div>
  );
};

export default FuturePasses;
