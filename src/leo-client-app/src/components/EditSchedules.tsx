import { useRouter } from "next/router";
import { BACKEND_URL, sendCommandSchedule } from "@/constants/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import ViewScheduleCard from "./ViewScheduleCard";
import "./styles/component.css";
import "../styles.css";
import "./styles/Scheduler.css";
import SatelliteName from "./SatelliteName";
import { Box, Card, Typography, Stack, Button, Table, Grid} from "@mui/material";
import axios from "axios";

const EditScheduler = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const satId = router.query?.satId?.toString() ?? "";
  const scheduleId = router.query?.scheduleId?.toString() ?? "";
  const satelliteId = router.query?.satelliteId?.toString() ?? "";
  const adminUserId: string = "65a5e11fe0d601e0e8c4a385";

  // operator
  const userId: string = "65a8181f36ea10b4366e1dd9";
  const isAdmin = adminUserId === userId;

  const [validCommands, setValidCommands] = useState([]);
  const [currentSchedule, setCurrentSchedule] = useState<string[]>([]);
  const [satelliteName, setSatelliteName] = useState<string>();

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

  const fetchValidCommands = (satelliteId: string) => {
    if (isAdmin) {
      fetch(`${BACKEND_URL}/satellite/getSatellite?satelliteId=${satelliteId}`)
        .then((response) => response.json())
        .then((data) => {
          setValidCommands(data.satellite.validCommands);
        })
        .catch((error) => {
          console.error("Error fetching valid commands Admin:", error);
        });
    } else {
      fetch(
        `${BACKEND_URL}/satelliteUser/getCommandsBySatelliteAndUser?satelliteId=${satelliteId}&userId=${userId}`
      )
        .then((response) => response.json())
        .then((data) => {
          setValidCommands(data.record[0].validCommands);
        })
        .catch((error) => {
          console.error("Error fetching valid commands for this user:", error);
        });
    }
  };

  const addCommand = (command: string) => {
    setCurrentSchedule((prevCommands) => [...prevCommands, command]);
  };

  const removeCommand = (index: number) => {
    setCurrentSchedule((currentSchedule) =>
      currentSchedule.filter((_, i) => i !== index)
    );
  };

  useEffect(() => {
    fetchValidCommands(satId);
  }, [satelliteId]);

  // Mutation function
  // asynchronous call to handle the api in order to send commands
  const { mutate } = useMutation({
    mutationFn: () =>
      sendCommandSchedule(userId, scheduleId, satelliteId, currentSchedule),

    //the callback function if calling api endpoint is successful
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["useGetCommandsBySchedule"] });
      setCurrentSchedule([]);
    },
    //the callback function if calling api endpoint is complete
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["useGetCommandsBySchedule"] });
      setCurrentSchedule([]);
    },
  });

  // Function will load schedule somewhere, currently console log for POC demo
  const sendSchedule = async () => {
    mutate();
  };

  return (
    <Stack
      direction="row"
      spacing={10}
      style={{
        display: "flex",
        gap: "2rem",
        width: "100%", 

      }}>
        <Box // This Box contains the SatelliteName and the ViewScheduleCard
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "2rem",

    }}
  >

      <Box px={"4px"} >
        <SatelliteName satelliteName={satelliteName as string} />
      </Box>
      <ViewScheduleCard scheduleId={scheduleId} userId={userId} />
      </Box>

      <Box
        style={{
          display: "flex",
          justifyContent: "space-around",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "2rem",

        }}
      >
        <Table
          sx={{
            minWidth: "200px",
            border: "2px solid white",
            borderRadius: "16px",
            padding: "10px",
            backgroundColor: "var(--material-theme-sys-dark-background)",
          }}
        >
          <Typography
            variant="h4"
            style={{
              width: "100%",
              color: "var(--material-theme-sys-light-secondary-container",
              padding: "25px"
            }}
          >
            Valid Commands to Add
          </Typography>
          {validCommands &&
            validCommands.length > 0 &&
            validCommands.map((command, index) => (
              <ul style={{color: "white", paddingBottom: '20px', textAlign: 'center'}}> 

              {command} 
              </ul>

              // <Button
              //   key={index}
              //   className="scheduleButton"
              //   onClick={() => addCommand(command)}
              // >
              // </Button>
            ))}

        </Table>
        {/* <Table
          sx={{
            border: "2px solid var(--material-theme-white)",
            borderRadius: "16px",
            padding: "10px",
            overflow: "auto",
            marginLeft: "220px",
            backgroundColor: "var(--material-theme-sys-dark-background)",
          }}
        >
          <Typography
            variant="h4"
            style={{
              width: "100%",
              color: "var(--material-theme-sys-light-secondary-container)",
            }}
          >
            Current Schedules
          </Typography>
          {currentSchedule &&
            currentSchedule.length > 0 &&
            currentSchedule.map((command, index) => (
              <Button
                key={index}
                className="removeButton scheduleButton"
                onClick={() => removeCommand(index)}>
                <Box className="buttonText" style={{ textAlign: "center" }}>
                  {command}
                </Box>
                <Box className="closeButton">X</Box>
              </Button>
            ))}
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <Button
              className="ClearScheduleButton"
              onClick={() => setCurrentSchedule([])}
              style={{
                display: "block",
                margin: "5px 0",
                color: "var(--material-theme-sys-light-secondary-container)",
                fontFamily: "Roboto",
              }}>
              Clear Schedule
            </Button>
            <Button
              onClick={() => sendSchedule()}
              style={{
                display: "block",
                margin: "5px 0",
                color: "var(--material-theme-sys-light-secondary-container)",
                fontFamily: "Roboto",
              }}>
              Send Schedule
            </Button>
          </div>
        </Table> */}
      </Box>
    </Stack>
  );
};

export default EditScheduler;
