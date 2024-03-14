import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import "../styles.css";
import SatelliteName from "./SatelliteName";
import "./styles/component.css";
import "./styles/Scheduler.css";
import { BACKEND_URL } from "@/constants/api";
import axios from "axios";
import NextLink from "next/link";

interface Schedule {
  id: string;
  startDate: string;
  endDate: string;
  satelliteId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

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
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
    if (satId) {
      fetchSchedules(satelliteId);
      fetchName();
    }
  }, [satelliteId]);

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
    <Box sx={{ padding: "20px" }}>
      <Box sx={{ bgcolor: "var(--material-theme-black)" }} px={"200px"}>
        <SatelliteName satelliteName={satelliteName} />
        <Typography variant="h5" className="headerBox3" style={{ fontSize: '2em', color: "var(--material-theme-white)" }}>
          Schedule Queue
        </Typography>
      </Box> 

        {/* <Typography className="headerBox3" style={{ fontSize: '2em', color: "var(--material-theme-white)" }}> */}
          {/* <Box className="schedulesPageContainer" sx={{ padding: "2%" }}> */}
          {/* <Box px={"10%"}>
        <SatelliteName satelliteName={satelliteName} />

        */}
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
                  sx={{ paddingTop: "17px", fontSize: "16px", color: "var(--material-theme-white)" }}
                >
                  Start Date
                </Typography>
                <TextField
                  type="date"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    if (filter === "Custom Date") {
                      fetchSchedules(satelliteId, e.target.value, endTime);
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
                  sx={{ paddingTop: "17px", fontSize: "16px", color: "var(--material-theme-white)"}}
                >
                  End Date
                </Typography>
                <TextField
                  type="date"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    if (filter === "Custom Date") {
                      fetchSchedules(satelliteId, startTime, e.target.value);
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
                        backgroundColor: "var(--material-theme-sys-dark-on-primary-container)",
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
          <Box className="main-schedule">
            <Stack alignItems="flex-start" spacing={1}>
              {isLoading ? (
                <Box className="loadingBox">
                  <CircularProgress />
                </Box>
              ) : (
                <Grid className="futureSchedulesBox" container spacing={2}>
                  {scheduleForCard &&
                    scheduleForCard.map((schedule, index) => (
                      <Grid item key={index} sx={{ width: "100%" }}>
                        <NextLink
                          href={`/edit-schedule/${satId}/${schedule.id}`}
                          passHref
                        >

                          <TableContainer component={Card} sx={{ backgroundColor: 'pink', borderRadius: '16px', margin: '0px' }}>
                            <Table sx={{ minWidth: 650 }}>
                              <TableHead>
                                <TableRow>
                                  <TableCell
                                    sx={{
                                      color: "var(--material-theme-black)",
                                      borderTop: 2,
                                      borderLeft: 2,
                                      borderRight: 2,
                                    }}
                                    align="left"
                                  >
                                    <Typography variant="h6"> Date </Typography>
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      color: "var(--material-theme-black)",
                                      borderTop: 2,
                                      borderRight: 2,
                                    }}
                                    align="left"
                                  >
                                    <Typography variant="h6"> Time </Typography>
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      color: "var(--material-theme-black)",
                                      borderTop: 2,
                                      borderRight: 2,
                                    }}
                                    align="left"
                                  >
                                    <Typography variant="h6"> Commands Scheduled </Typography>
                                  </TableCell>

                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {scheduleForCard.map((schedule) => (
                                  <TableRow key={schedule.id}
                                    // sx={{ '&:last-child td, &:last-child th': { border: 0 }



                                    // }}

                                    sx={{
                                      borderBottom: 2,
                                      borderTop: 2,
                                      borderLeft: 2,
                                      borderRight: 2,
                                      // "&:last-child td, &:last-child th": { border: 1 },
                                    }}

                                  >


                                    <TableCell component="th" scope="row" sx={{ color: "black !important", borderRight: 2 }}
                                      align="left">
                                      <Typography variant="subtitle1">{formatDate(schedule.startDate)}</Typography>
                                    </TableCell>
                                    <TableCell component="th" scope="row" sx={{ color: "black !important", borderRight: 2 }}
                                      align="left">
                                      <Typography variant="subtitle1">{formatTimeRange(schedule.startDate, schedule.endDate)}</Typography>
                                    </TableCell>

                                    <TableCell>
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
                                                  <li> {commandObj.command}</li>
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

                                    </TableCell>
                                  </TableRow>

                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>

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
