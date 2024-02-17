import React, { useEffect, useState } from "react";
import '../components/Scheduler.css'; 
import { useRouter } from "next/router";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
} from "@mui/material";

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
  const [schedules1, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scheduleCommands, setScheduleCommands] = useState<{
    [scheduleId: string]: string[];
  }>({});

  const fetchSchedules = (satelliteId: string) => {
    setIsLoading(true); 
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

  const router = useRouter();

  return (
    <div className="upcomingSchedulesBox" >
      <p className="headerBox">Satellite Name</p>
      <p className="headerBox2">All Schedules</p>
      <p className="headerBox3">Schedule Queue</p>
      <div className="main-schedule"> 
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
              // flexWrap: "nowrap",
              // overflowX: "auto",
              maxWidth: "10vw", 
              boxSizing: "border-box",
              "& .MuiGrid-item": {
                flex: "0 0 auto",
              },
              mx: -2,
            }}
          >
            {schedules1 &&
              schedules1.map((schedule, index) => (
                <Grid item key={index}>
                  <Card
                    sx={{
                      minWidth: 800,
                      minHeight: 200,
                      margin: 0.5,
                      backgroundColor:
                        "var(--material-theme-sys-light-inverse-on-surface)",
                      cursor: "pointer",
                      borderRadius: 3,
                    }}>
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
                      <button className="edit-button" onClick={()=>{router.push('/edit-schedules')}} > Edit Schedules </button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        )}
      </Stack>
      </div>
      </div>
  );
            };
export default Scheduler;