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

type Props = {
  noradId: string;
};

const EditScheduler = ({ noradId }: Props) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  // const satelliteId = "655acd63d122507055d3d2ea";
  const satelliteId = router.query?.satelliteId?.toString() ?? "";
  // console.log(typeof(satelliteId), "hi");
  const adminUserId: string = "65a5e11fe0d601e0e8c4a385";

  // operator
  const userId: string = "65a8181f36ea10b4366e1dd9";
  const scheduleId = "65a8182036ea10b4366e1de6";
  const isAdmin = adminUserId === userId;

  const [validCommands, setValidCommands] = useState([]);
  const [currentSchedule, setCurrentSchedule] = useState<string[]>([]);

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
    fetchValidCommands(satelliteId);
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
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "2rem",
      }}>
      <Box px={"4px"}>
        <SatelliteName noradId="55098" />
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
    </Stack>
  );
};

export default EditScheduler;