import React, { useEffect, useState } from "react";
import '../components/Scheduler.css'; // Import the CSS styles
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import EditSchedulePage from "@/components/EditSchedules";
import { useRouter } from "next/router";
import { sendCommandSchedule } from "@/constants/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ViewScheduleCard from "./ViewScheduleCard";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
} from "@mui/material";
//import Scheduler from "@/components/EditSchedules";


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
  // TODO: Dynamically get satelliteId from somewhere
  const satelliteId = "655acd63d122507055d3d2ea";
  const [schedules1, setSchedules] = useState<Schedule[]>([]);
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
              //flexWrap: "nowrap",
              //overflowX: "auto",
              maxWidth: "10vw", // Use 100vw to ensure it considers the full viewport width
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
                      minWidth: 900,
                      minHeight: 200,
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
                          <button className="edit-button" onClick={()=>{router.push('/edit-schedules')}} > Edit Schedules </button>
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

      </div>
    
  );

            };
export default Scheduler;


  // const ScheduleComponent: React.FC<{ schedule: Schedule }> = ({ schedule }) => {
  //   const router = useRouter();
  //   return (
  //     <div className="schedule">
  //       <div className="schedule-header">
  //         {schedule.startDate} 
  //         {/* <br> </br> */}
  //         {schedule.startTime} - {schedule.endTime}
  //       </div>
  //       <ul className="commands">
  //         {schedule.commands.map((command, index) => (
  //           <li key={index}>{command.name}</li>
  //         ))}
  //       </ul>

  //       <button onClick={()=>{router.push('/edit-schedules')}} > Edit Schedules </button>
        
  //     </div>
  //   )};
          
  // const SchedulesPage: React.FC = () => {
  //   return (
  //     <div className="schedules-page">
  //       {/* this is for satellite name title; for now its being hardcoded later on it will be dynamic (another pr) */}
  //       <header> 
  //         <div className='satellite-name'>
  //           Satellite Name
  //         </div>
  //       </header>
  //       {/* All schedules for that particular satellite */}
  //       <header>
  //         <div className='all-schedules'>
  //             All Schedules
  //           </div>
  //       </header>
  //       <header> 
  //         <div className='schedule-queue'> 
  //       Schedule Queue
  //         </div> 
  //       </header>
    
  //       <div className="schedule-queue">
  //         {schedules1.map((schedule, index) => (
  //           <ScheduleComponent key={index} schedule={schedule} />
  //         ))}
  //         {/* button for edit schedules */}
  //       </div>
  //       <button className="add-schedule">+</button>
  //     </div>
  // )};


// // Mock data
// const schedules: Schedule[] = [
//   {
//     date: "Jan 9 2024",
//     startTime: "9:10 AM",
//     endTime: "9:12 AM",
//     commands: [
//       { name: "Setup" },
//       { name: "Command 1" },
//       { name: "Command 2" },
//       { name: "Command 3" },
//       { name: "Teardown" },
//     ],
//   },
//   {
//     date: "Jan 9 2024",
//     startTime: "9:10 AM",
//     endTime: "9:12 AM",
//     commands: [
//       { name: "Setup" },
//       { name: "Command 1" },
//       { name: "Command 2" },
//       { name: "Command 3" },
//       { name: "Teardown" },
//     ],
//   },
//   {
//     date: "Jan 9 2024",
//     startTime: "9:10 AM",
//     endTime: "9:12 AM",
//     commands: [
//       { name: "Setup" },
//       { name: "Command 1" },
//       { name: "Command 2" },
//       { name: "Command 3" },
//       { name: "Teardown" },
//     ],
//   },
//   // ... more schedules
// ];


// const Scheduler: React.FC = () => {
//   const queryClient = useQueryClient();

//   // TODO: Dynamicall get satelliteId from somewhere
//   const satelliteId = "655acd63d122507055d3d2ea";

//   const adminUserId: string = "65a5e11fe0d601e0e8c4a385";

//   // admin
//   // const userId: string = "65a5e11fe0d601e0e8c4a385";

//   // operator
//   const userId: string = "65a8181f36ea10b4366e1dd9";

//   const scheduleId = "65a8182036ea10b4366e1de6";
//   const isAdmin = adminUserId === userId;

//   const [validCommands, setValidCommands] = useState([]);
//   const [currentSchedule, setCurrentSchedule] = useState<string[]>([]);

//   const fetchValidCommands = (satelliteId: string) => {
//     if (isAdmin) {
//       fetch(
//         `http://localhost:3001/satellite/getSatellite?satelliteId=${satelliteId}`
//       )
//         .then((response) => response.json())
//         .then((data) => {
//           setValidCommands(data.satellite.validCommands);
//         })
//         .catch((error) => {
//           console.error("Error fetching valid commands:", error);
//         });
//     } else {
//       fetch(
//         `http://localhost:3001/satelliteUser/getCommandsBySatelliteAndUser?satelliteId=${satelliteId}&userId=${userId}`
//       )
//         .then((response) => response.json())
//         .then((data) => {
//           setValidCommands(data.record[0].validCommands);
//         })
//         .catch((error) => {
//           console.error("Error fetching valid commands:", error);
//         });
//     }
//   };

//   const addCommand = (command: string) => {
//     setCurrentSchedule((prevCommands) => [...prevCommands, command]);
//   };

//   const removeCommand = (index: number) => {
//     setCurrentSchedule((currentSchedule) =>
//       currentSchedule.filter((_, i) => i !== index)
//     );
//   };

//   useEffect(() => {
//     fetchValidCommands(satelliteId);
//   }, [satelliteId]);

//   // Mutation function
//   const { mutate } = useMutation({
//     mutationFn: () =>
//       sendCommandSchedule(userId, scheduleId, satelliteId, currentSchedule),

//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["useGetCommandsBySchedule"] });
//       setCurrentSchedule([]);
//     },

//     onSettled: () => {
//       queryClient.invalidateQueries({ queryKey: ["useGetCommandsBySchedule"] });
//       setCurrentSchedule([]);
//     },
//   });

//   // Function will load schedule somewhere, currently console log for POC demo
//   const sendSchedule = async () => {
//     mutate();
//   };

//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "flex-start",
//         gap: "4rem",
//       }}>
//       <h1> Satellite Name </h1>

//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-around",
//           alignItems: "flex-start",
//         }}>
//         <div
//           style={{
//             minWidth: "200px",
//             border: "2px solid white",
//             borderRadius: "16px",
//             padding: "10px",
//           }}>
//           <h2>Valid Commands</h2>
//           <div>
//             {validCommands &&
//               validCommands.length > 0 &&
//               validCommands.map((command, index) => (
//                 <button
//                   key={index}
//                   className="scheduleButton"
//                   onClick={() => addCommand(command)}>
//                   {command}
//                 </button>
//               ))}
//           </div>
//         </div>

//         <div style={{ width: "50px" }}></div>

//         <div
//           style={{
//             border: "2px solid white",
//             borderRadius: "16px",
//             padding: "10px",
//             overflow: "auto",
//           }}>
//           <h2>Current Schedule</h2>
//           {currentSchedule &&
//             currentSchedule.length > 0 &&
//             currentSchedule.map((command, index) => (
//               <button
//                 key={index}
//                 className="removeButton scheduleButton"
//                 onClick={() => removeCommand(index)}>
//                 <span className="buttonText">{command}</span>
//                 <span className="closeButton">X</span>
//               </button>
//             ))}
//           <div style={{ display: "flex", justifyContent: "space-around" }}>
//             <button
//               onClick={() => setCurrentSchedule([])}
//               style={{ display: "block", margin: "5px 0" }}>
//               Clear Schedule
//             </button>
//             <button
//               onClick={() => sendSchedule()}
//               style={{ display: "block", margin: "5px 0" }}>
//               Send Schedule
//             </button>
//           </div>
//         </div>
//       </div>
//       <ViewScheduleCard scheduleId={scheduleId} userId={userId} />
//     </div>
//   );
// };


// export default Scheduler;
