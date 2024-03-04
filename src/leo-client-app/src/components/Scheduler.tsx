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
const Scheduler = ({ noradId }: Props) => {
  const satelliteId = "655acd63d122507055d3d2ea";
  const [scheduleForCard, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scheduleCommands, setScheduleCommands] = useState<{
    [scheduleId: string]: string[];
  }>({});

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
    fetchSchedules(satelliteId);
  }, [satelliteId]);

  const router = useRouter();

  return (
    <Box className="schedulesPageContainer" sx={{ padding: "20px" }}>
      <Box px={"200px"}>
        <SatelliteName noradId={noradId} />
        <Typography variant="h5" className="headerBox2">
          All Schedules
        </Typography>
        <Typography variant="h5" className="headerBox3">
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
              }}>
              {scheduleForCard &&
                scheduleForCard.map((schedule, index) => (
                  <Grid item key={index} sx={{ width: "98%" }}>
                    <Card
                      sx={{
                        width: "99%",
                        minHeight: 100,
                        margin: 0.5,
                        backgroundColor:
                          "var(--material-theme-sys-light-primary-container)",
                        cursor: "pointer",
                        borderRadius: 4,
                      }}>
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
                                      className="cardSubtitle">
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
                                }}>
                                No commands
                              </Typography>
                            )}
                          </>
                        </Stack>
                        {/* the router.push navigates the user to said pathname and the satelliteID is the prop for edit schedules page  */}
                        <Button
                          className="edit-button"
                          onClick={() => {
                            router.push({
                              pathname: "/edit-schedules",
                              query: { satelliteId },
                            });
                          }}
                          sx={{
                            color: "var(--material-theme-black)",
                            fontFamily: "Roboto",
                            marginTop: "10px",
                          }}>
                          {" "}
                          Edit Schedules{" "}
                        </Button>
                      </CardContent>
                    </Card>
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
