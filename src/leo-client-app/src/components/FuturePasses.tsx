import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import axios from "axios";
import "../styles.css";
import "./styles/component.css";
import "./styles/futurePasses.css";

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
    <div className="futurePasses">
      <Stack alignItems="flex-start" spacing={1}>
        <p className="headerBox">Next Week&apos;s Passes</p>
        {isLoading ? (
          <Box className="loadingBox">
            <CircularProgress />
          </Box>
        ) : (
          <Grid className="futurePassesBox" container spacing={1}>
            {" "}
            {passes &&
              passes.map((passPair, index) => (
                <Grid item key={index}>
                  {" "}
                  <NextLink
                    href={`/detailed-display/${noradId}/${encodeURIComponent(
                      formatDateToISO(passPair[0].time)
                    )}/${encodeURIComponent(
                      formatDateToISO(passPair[1].time)
                    )}`}
                    passHref
                  >
                    <Card
                      sx={{
                        minWidth: 150,
                        margin: 0.5,
                        backgroundColor:
                          "var(--material-theme-sys-light-inverse-on-surface)",
                        cursor: "pointer",
                        borderRadius: 3,
                      }}
                    >
                      <CardContent>
                        <Stack spacing={0}>
                          <p className="cardTitle">
                            {formatDate(passPair[0].time)}
                          </p>
                          <p className="cardSubtitle">
                            {formatTimeRange(
                              passPair[0].time,
                              passPair[1].time
                            )}
                          </p>
                        </Stack>
                      </CardContent>
                    </Card>
                  </NextLink>
                </Grid>
              ))}
          </Grid>
        )}
      </Stack>
    </div>
  );
};

export default FuturePasses;
