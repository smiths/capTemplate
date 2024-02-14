import React, { useEffect, useState } from "react";
import "../styles.css";
import "./styles/component.css";
import "./styles/upcomingSchedules.css";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
} from "@mui/material";

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

const UpcomingSchedules = ({ noradId }: Props) => {
  // TODO: Dynamically get satelliteId from somewhere
  const satelliteId = "655acd63d122507055d3d2ea";
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scheduleCommands, setScheduleCommands] = useState<{
    [scheduleId: string]: string[];
  }>({});

  const fetchSchedules = (satelliteId: string) => {
    setIsLoading(true); // Set loading state to true when starting to fetch
    fetch(
      `http://localhost:3001/schedule/getSchedulesBySatellite?satelliteId=${satelliteId}&page=1&limit=100`
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
          // Set the transformed schedules
          setSchedules(transformedSchedules);
          // After setting schedules, fetch commands for each schedule
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
      .finally(() => setIsLoading(false)); // Reset loading state regardless of result
  };

  const fetchCommandsPerScheduleAndUpdateState = (scheduleId: string) => {
    fetch(
      `http://localhost:3001/schedule/getCommandsBySchedule?scheduleId=${scheduleId}`
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

  return (
    <div className="upcomingSchedulesBox">
      <Stack alignItems="flex-start" spacing={1}>
        <p className="headerBox">Schedule Queue</p>
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
              flexWrap: "nowrap",
              overflowX: "auto",
              maxWidth: "98vw", // Use 100vw to ensure it considers the full viewport width
              boxSizing: "border-box", // Ensure padding and borders are included in the element's total width
              "& .MuiGrid-item": {
                flex: "0 0 auto",
              },
              // Consider padding or margins that might affect the total width
              mx: -2, // Adjust this value based on your layout needs, to compensate for outer margins if necessary
            }}
          >
            {schedules &&
              schedules.map((schedule, index) => (
                <Grid item key={index}>
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
                          {formatDate(schedule.startDate)}
                        </p>

                        <p className="cardSubtitle">
                          {formatTimeRange(
                            schedule.startDate,
                            schedule.endDate
                          )}
                        </p>

                        <>
                          {scheduleCommands[schedule.id] &&
                          scheduleCommands[schedule.id].length > 0 ? (
                            scheduleCommands[schedule.id].map(
                              (commandObj: any, cmdIndex) => (
                                // Render each command in a separate <p> tag
                                <p key={cmdIndex} className="cardSubtitle">
                                  {commandObj.command}
                                </p>
                              )
                            )
                          ) : (
                            <p className="cardSubtitle">No commands</p>
                          )}
                        </>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        )}
      </Stack>
    </div>
  );
};

export default UpcomingSchedules;
