import {
  Box,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  MenuItem,
  Select,
  FormControl,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
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

function parseLocalDate(dateString: string) {
  const [year, month, day] = dateString.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toISOString();
}

const FuturePasses = ({ noradId }: Props) => {
  const [passes, setPasses] = useState<Pass[][]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  function formatDateToISO(dateString: string) {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 19) + "Z";
  }

  const fetchPasses = async (
    noradId: string,
    startTime: string = "",
    endTime: string = ""
  ) => {
    setIsLoading(true);

    let endpoint = `${BACKEND_URL}/satellite/getNextPasses`;

    const defaultParams: any = {
      noradId,
    };

    let queryParams = new URLSearchParams(defaultParams);

    if (startTime) {
      endpoint = `${BACKEND_URL}/satellite/getNextPassesByTime`;
      queryParams = new URLSearchParams({
        ...defaultParams,
        ...(startTime && { startTime: startTime }),
        ...(endTime && { endTime: endTime }),
      });
    }

    try {
      const res = await axios.get(`${endpoint}?${queryParams}`);
      setPasses(res.data?.nextPasses ?? []);
    } catch (error) {
      console.error("Error fetching passes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const runFetch = async () => {
      setIsLoading(true);
      await fetchPasses(noradId, startTime, endTime); // Fetch data initially
      setIsLoading(false);
    };
    void runFetch();
  }, [noradId, startTime, endTime]);

  const [filter, setFilter] = useState("Show All Passes");
  const handleFilterChange = (event: any) => {
    const newFilter = event.target.value as string;
    setFilter(newFilter);

    if (newFilter === "Show All Passes") {
      fetchPasses(noradId);
    } else if (newFilter === "Custom Date") {
      setStartTime("");
      setEndTime("");
      fetchPasses(noradId, "", "");
    }
  };

  return (
    <div className="futurePasses">
      <Stack alignItems="flex-start" spacing={1}>
        <p className="headerBox">Next Week&apos;s Passes</p>
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
                sx={{ paddingTop: "17px", fontSize: "16px" }}
              >
                Start Date
              </Typography>
              <TextField
                type="date"
                value={startTime}
                onChange={(e) => {
                  const localDate = parseLocalDate(e.target.value);
                  setStartTime(localDate);
                  if (filter === "Custom Date") {
                    fetchPasses(noradId, localDate, endTime);
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
                sx={{ paddingTop: "17px", fontSize: "16px" }}
              >
                End Date
              </Typography>
              <TextField
                type="date"
                value={endTime}
                onChange={(e) => {
                  const localDate = parseLocalDate(e.target.value);
                  setEndTime(localDate);
                  if (filter === "Custom Date") {
                    fetchPasses(noradId, startTime, localDate);
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
              <MenuItem value="Show All Passes">Show All Passes</MenuItem>
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
