import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Button,
  Typography,
} from "@mui/material";
import "../styles.css";
import SatelliteName from "./SatelliteName";
import "./styles/component.css";
import "./styles/Scheduler.css";
import { BACKEND_URL } from "@/constants/api";
import axios from "axios";
import NextLink from "next/link";

interface Command {
  name: string;
}
interface Schedule {
  id: string;
  startDate: string;
  endDate: string;
  satelliteId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
type Props = {
  noradId: string;
};

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
const Scheduler = () => {
  const router = useRouter();
  let { satId } = router.query as {
    satId: string;
  };

  const satelliteId = satId;
  const [scheduleForCard, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scheduleCommands, setScheduleCommands] = useState<{
    [scheduleId: string]: string[];
  }>({});
  const [satelliteName, setSatelliteName] = useState<string>("BDSAT-2");

  const fetchName = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/satellite/getSatellite`, {
        params: { satelliteId: satId },
      });
      setSatelliteName(res.data.satellite.name);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchSchedules = (satelliteId: string) => {
    setIsLoading(true);
    fetch(
      `${BACKEND_URL}/schedule/getSchedulesBySatellite?satelliteId=${satelliteId}&page=1&limit=100`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.schedules) {
          // Map through each schedule and create a new schedule object
          const transformedSchedules = data.schedules.map((schedule: any) => ({
            id: schedule._id,
            startDate: schedule.startDate,
            endDate: schedule.endDate,
            satelliteId: schedule.satelliteId,
            status: schedule.status,
            createdAt: schedule.createdAt,
            updatedAt: schedule.updatedAt,
          }));
          setSchedules(transformedSchedules);
          transformedSchedules.forEach((schedule: Schedule) => {
            fetchCommandsPerScheduleAndUpdateState(schedule.id);
          });
        } else {
          setSchedules([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching satellite schedules:", error);
      })
      .finally(() => setIsLoading(false));
  };

  const fetchCommandsPerScheduleAndUpdateState = (scheduleId: string) => {
    fetch(
      `${BACKEND_URL}/schedule/getCommandsBySchedule?scheduleId=${scheduleId}`
    )
      .then((response) => response.json())
      .then((data) => {
        setScheduleCommands((prevCommands) => ({
          ...prevCommands,
          [scheduleId]: data.commands ?? [],
        }));
      })
      .catch((error) => {
        console.error("Error fetching schedule commands:", error);
      });
  };

  useEffect(() => {
    fetchName();
    fetchSchedules(satelliteId);
  }, [satelliteId]);
  useEffect(() => {
    fetchName();
  });

  return (
    <Box className="schedulesPageContainer" sx={{ padding: "20px" }}>
      <Box sx = {{bgcolor: "var(--material-theme-black)"}}px={"200px"}>
        <SatelliteName satelliteName={satelliteName} />
        <Typography className="headerBox2" style={{fontSize: '2em', color: "var(--material-theme-white)"}}>
          All Schedules
        </Typography>
        <Typography className="headerBox3" style={{fontSize: '2em', color: "var(--material-theme-white)"}}>
          Schedule Queue
        </Typography>
      </Box>
      <Box className="main-schedule">
        <Stack alignItems="flex-start" spacing={1}>
          {isLoading ? (
            <Box className="loadingBox">
              <CircularProgress />
            </Box>
          ) : (
            <Grid
              className="futureSchedulesBox"
              container
              spacing={2}
              sx={{
                display: "flex",
                boxSizing: "border-box",
                "& .MuiGrid-item": {
                  flex: "0 0 auto",
                },
                border: 3,
                borderRadius: "24px",
                borderColor: "var(--material-theme-white)",
                width: "85%",
                mx: -2,
              }}
            >
              {scheduleForCard &&
                scheduleForCard.map((schedule, index) => (
                  <Grid item key={index} sx={{ width: "98%" }}>
                    <NextLink
                      href={`/edit-schedule/${satId}/${schedule.id}`}
                      passHref
                    >
                      <Card
                        sx={{
                          width: "99%",
                          minHeight: 100,
                          margin: 0.5,
                          backgroundColor:
                            "var(--material-theme-sys-light-primary-container)",
                          cursor: "pointer",
                          borderRadius: 4,
                        }}
                      >
                        <CardContent>
                          <Stack spacing={1}>
                            <Typography className="cardTitle">
                              {formatDate(schedule.startDate)}
                            </Typography>
                            <Typography className="cardSubtitle">
                              {formatTimeRange(
                                schedule.startDate,
                                schedule.endDate
                              )}
                            </Typography>
                            <>
                              {scheduleCommands[schedule.id] &&
                              scheduleCommands[schedule.id].length > 0 ? (
                                <>
                                  {scheduleCommands[schedule.id]
                                    .slice(0, 3)
                                    .map((commandObj: any, cmdIndex) => (
                                      <Typography
                                        key={cmdIndex}
                                        className="cardSubtitle"
                                      >
                                        {commandObj.command}
                                      </Typography>
                                    ))}
                                  {scheduleCommands[schedule.id].length > 3 && (
                                    <Typography className="cardSubtitle">
                                      {" "}
                                      ...{" "}
                                    </Typography>
                                  )}
                                </>
                              ) : (
                                <Typography
                                  className="cardSubtitle"
                                  sx={{
                                    padding: "0px",
                                    fontSize: "15px",
                                    color: "var(--material-theme-black)",
                                  }}
                                >
                                  No commands
                                </Typography>
                              )}
                            </>
                          </Stack>
                        </CardContent>
                      </Card>
                    </NextLink>
                  </Grid>
                ))}
            </Grid>
          )}
          <Box />
        </Stack>
      </Box>
    </Box>
  );
};
export default Scheduler;
