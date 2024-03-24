import React, { useEffect, useState } from "react";
import "../styles.css";
import "./styles/component.css";
import "./styles/upcomingSchedules.css";
import "./styles/futurePasses.css";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  FormControl,
  Select,
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

function parseLocalDate(dateString: string) {
  const [year, month, day] = dateString.split("-");
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
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
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  function formatDateToISO(dateString: string) {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 19) + "Z";
  }

  const fetchSchedules = (
    satelliteId: string,
    startTime: string = "",
    endTime: string = ""
  ) => {
    setIsLoading(true);

    let endpoint = `${BACKEND_URL}/schedule/getSchedulesBySatellite`;

    const defaultParams: any = {
      satelliteId,
      page: 1,
      limit: 100,
    };

    let queryParams = new URLSearchParams(defaultParams);

    if (startTime) {
      endpoint = `${BACKEND_URL}/schedule/getScheduleBySatelliteAndTime`;
      queryParams = new URLSearchParams({
        ...defaultParams,
        ...(startTime && { startTime: startTime }),
        ...(endTime && { endTime: endTime }),
      });
    }

    fetch(`${endpoint}?${queryParams}`)
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

  function clearFilter(
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void {
    setStartTime("");
    setEndTime("");
    fetchSchedules(satelliteId);
  }

  const [filter, setFilter] = useState("Show All Schedules");
  const handleFilterChange = (event: any) => {
    setFilter(event.target.value);
    if (event.target.value === "Show All Schedules") {
      clearFilter(event);
    }
  };

  return (
    <Box className="upcomingSchedules">
      <Stack alignItems="flex-start" spacing={1}>
        <p className="headerBox">Schedule Queue</p>
        <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: "20px",
          justifyContent: "right",
          paddingRight: "10%",
        }}
      >
        {filter === "Custom Date" && (
          <>
            <Typography
              variant="h6"
              sx={{
                paddingTop: "17px",
                fontSize: "16px",
                color: "var(--material-theme-white)",
              }}
            >
              Start Date
            </Typography>
            <TextField
              type="date"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                if (filter === "Custom Date") {
                  const localDate = parseLocalDate(e.target.value);
                  fetchSchedules(satelliteId, localDate.toISOString(), endTime);
                }
              }}
              InputLabelProps={{ shrink: true }}
              inputProps={{ style: { color: "var(--material-theme-white)" } }}
              sx={{
                "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--material-theme-white)",
                  borderRadius: "15px",
                },
              }}
            />
            <Typography
              variant="h6"
              sx={{
                paddingTop: "17px",
                fontSize: "16px",
                color: "var(--material-theme-white)",
              }}
            >
              End Date
            </Typography>
            <TextField
              type="date"
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value);
                if (filter === "Custom Date") {
                  const localDate = parseLocalDate(e.target.value);
                  fetchSchedules(
                    satelliteId,
                    startTime,
                    localDate.toISOString()
                  );
                }
              }}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                style: {
                  color: "var(--material-theme-white)",
                  borderColor: "var(--material-theme-white)",
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--material-theme-white)",
                  borderRadius: "15px",
                },
              }}
            />
          </>
        )}
        <FormControl variant="outlined" sx={{ width: "230px" }}>
          <Select
            value={filter}
            onChange={handleFilterChange}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "transparent",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--material-theme-sys-dark-on-primary)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--material-theme-sys-dark-on-primary)",
              },
              textTransform: "none",
              fontSize: "1rem",
              "& .MuiSelect-select": {
                paddingLeft: "30px",
              },
              backgroundColor: "var(--material-theme-sys-dark-primary)",
              color: "var(--material-theme-sys-dark-on-primary)",
              borderRadius: "15px",
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: "var(--material-theme-sys-dark-primary)",
                  color: "var(--material-theme-sys-dark-on-primary)",
                  borderRadius: "15px",
                  "& .MuiMenuItem-root:hover": {
                    backgroundColor:
                      "var(--material-theme-sys-dark-on-primary-container)",
                  },
                },
              },
            }}
          >
            <MenuItem value="Show All Schedules">Show All Schedules</MenuItem>
            <MenuItem value="Custom Date">Custom Date</MenuItem>
          </Select>
        </FormControl>
      </Box>
        <div className="futurePassesBox">
          {isLoading ? (
            <Box className="loadingBox">
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                maxWidth: "100%",
                maxHeight: "400px",
                borderRadius: "15px",
                border: "2px solid black",
                overflow: "auto",
                background: "var(--material-theme-sys-light-primary-fixed)",
                "& .MuiTableCell-root": {
                  borderBottom: "2px solid black",
                  color: "var(--material-theme-black)",
                  textAlign: "left",
                  fontSize: "15px",
                },
              }}
            >
              <Table stickyHeader aria-label="simple table">
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
                    <TableCell>Schedule</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedules.map((schedule, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        borderBottom: 2,
                        borderTop: 2,
                      }}
                    >
                      <TableCell
                        component="th"
                        scope="row"
                        sx={{ color: "black !important" }}
                        align="left"
                      >
                        <Typography variant="subtitle1">
                          {formatDate(schedule.startDate)}
                        </Typography>
                      </TableCell>
                      <TableCell
                        component="th"
                        scope="row"
                        sx={{ color: "black !important" }}
                        align="left"
                      >
                        <Typography variant="subtitle1">
                          {formatTimeRange(
                            schedule.startDate,
                            schedule.endDate
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <NextLink
                          href={`/edit-schedule/${satId}/${schedule.id}`}
                          passHref
                        >
                          View Details
                        </NextLink>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>
      </Stack>
    </Box>
  );
};

export default UpcomingSchedules;
