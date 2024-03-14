import { useRouter } from "next/router";
import { BACKEND_URL, sendCommandSchedule } from "@/constants/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import ViewScheduleCard from "./ViewScheduleCard";
import "./styles/component.css";
import "../styles.css";
import "./styles/Scheduler.css";
import SatelliteName from "./SatelliteName";
import { Box, Card, Typography, Stack, Button } from "@mui/material";
import axios from "axios";
import { ReactTerminal } from "react-terminal";

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

  const commands = {
    help: (
      <Stack flexWrap={"wrap"} direction={"row"} spacing={4}>
        {validCommands.map((cmd, index) => (
          <Typography key={cmd + index}>{cmd}</Typography>
        ))}
      </Stack>
    ),
  };

  const delay = (ms: any) => new Promise((res) => setTimeout(res, ms));

  return (
    <Stack
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "2rem",
      }}>
      <Box px={"4px"}>
        <SatelliteName satelliteName={satelliteName as string} />
      </Box>
      <Box
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "flex-start",
        }}>
        <Card
          sx={{
            minWidth: "200px",
            border: "2px solid white",
            borderRadius: "16px",
            padding: "10px",
            backgroundColor: "var(--material-theme-sys-dark-background)",
          }}>
          <Typography
            variant="h4"
            style={{
              width: "100%",
              color: "var(--material-theme-sys-light-secondary-container",
            }}>
            Valid Commands
          </Typography>
          {validCommands &&
            validCommands.length > 0 &&
            validCommands.map((command, index) => (
              <Button
                key={index}
                className="scheduleButton"
                onClick={() => addCommand(command)}>
                {command}
              </Button>
            ))}
        </Card>
        <Card
          sx={{
            border: "2px solid var(--material-theme-white)",
            borderRadius: "16px",
            padding: "10px",
            overflow: "auto",
            marginLeft: "220px",
            backgroundColor: "var(--material-theme-sys-dark-background)",
          }}>
          <Typography
            variant="h4"
            style={{
              width: "100%",
              color: "var(--material-theme-sys-light-secondary-container)",
            }}>
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
          {/* need this div for clear formatting within the cards */}
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
        </Card>
      </Box>
      <ViewScheduleCard scheduleId={scheduleId} userId={userId} />

      <Box sx={{ width: "100%", height: 300 }}>
        <ReactTerminal
          commands={commands}
          // showControlBar={false}
          themes={{
            "my-custom-theme": {
              themeBGColor: "#272B36",
              themeToolbarColor: "#DBDBDB",
              themeColor: "#FFFEFC",
              themePromptColor: "#a917a8",
            },
          }}
          theme="my-custom-theme"
          defaultHandler={async (request: any) => {
            const isValid = validCommands.some((cmd) => cmd === request);
            if (!isValid) {
              return "Invalid command sequence";
            }
            await delay(5000);
            return "Command sent";
          }}
        />
      </Box>
    </Stack>
  );
};

export default EditScheduler;
