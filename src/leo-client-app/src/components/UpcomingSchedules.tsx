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
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import NextLink from "next/link";
import { BACKEND_URL } from "@/constants/api";
import axios from "axios";
import { useRouter } from "next/router";

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
  const router = useRouter();
  const { satId } = router.query;
  const [satelliteId, setSatelliteId] = useState<string>(satId as string);

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scheduleCommands, setScheduleCommands] = useState<{
    [scheduleId: string]: string[];
  }>({});

  function formatDateToISO(dateString: string) {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 19) + "Z";
  }

  const fetchSchedules = (satelliteId: string) => {
    setIsLoading(true); // Set loading state to true when starting to fetch
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

  useEffect(() => {
    fetchSchedules(satelliteId);
  }, [noradId]);

  return (
    <div className="upcomingSchedules">
      <Stack alignItems="flex-start" spacing={1}>
        <p className="headerBox">Schedule Queue</p>
        <div className="upcomingSchedulesBox">
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
                    <TableCell>Commands</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedules &&
                    schedules.map((schedule, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          "&:hover": { cursor: "pointer" },
                        }}
                        onClick={() =>
                          router.push(`/edit-schedule/${satId}/${schedule.id}`)
                        }
                      >
                        <TableCell align="left" component="th" scope="row">
                          {formatDate(schedule.startDate)}
                        </TableCell>
                        <TableCell align="left">
                          {formatTimeRange(
                            schedule.startDate,
                            schedule.endDate
                          )}
                        </TableCell>
                        <TableCell align="left" component="th" scope="row">
                          {scheduleCommands[schedule.id] &&
                          scheduleCommands[schedule.id].length > 0
                            ? scheduleCommands[schedule.id]
                                .slice(0, 3)
                                .map((commandObj: any, cmdIndex) => (
                                  <div key={cmdIndex}>{commandObj.command}</div>
                                ))
                            : "No commands"}
                          {scheduleCommands[schedule.id] &&
                            scheduleCommands[schedule.id].length > 3 && (
                              <div>...</div>
                            )}
                        </TableCell>
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

export default UpcomingSchedules;
