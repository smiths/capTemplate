import { useRouter } from "next/router";
import { sendCommandSchedule } from "@/constants/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import ViewScheduleCard from "./ViewScheduleCard";
import './styles/component.css';
import "../styles.css";

import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Button,
} from "@mui/material";


const Scheduler = ({noradId}: Props) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const satelliteId = "655acd63d122507055d3d2ea";
  const adminUserId: string = "65a5e11fe0d601e0e8c4a385";
  // admin
  // const userId: string = "65a5e11fe0d601e0e8c4a385";

  // operator
  const userId: string = "65a8181f36ea10b4366e1dd9";
  const scheduleId = "65a8182036ea10b4366e1de6";
  const isAdmin = adminUserId === userId;

  const [validCommands, setValidCommands] = useState([]);
  const [currentSchedule, setCurrentSchedule] = useState<string[]>([]);

  const fetchValidCommands = (satelliteId: string) => {
    if (isAdmin) {
      fetch(
        `http://localhost:3001/satellite/getSatellite?satelliteId=${satelliteId}`
      )
        .then((response) => response.json())
        .then((data) => {
          setValidCommands(data.satellite.validCommands);
        })
        .catch((error) => {
          console.error("Error fetching valid commands:", error);
        });
    } else {
      fetch(
        `http://localhost:3001/satelliteUser/getCommandsBySatelliteAndUser?satelliteId=${satelliteId}&userId=${userId}`
      )
        .then((response) => response.json())
        .then((data) => {
          setValidCommands(data.record[0].validCommands);
        })
        .catch((error) => {
          console.error("Error fetching valid commands:", error);
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
  const { mutate } = useMutation({
    mutationFn: () =>
      sendCommandSchedule(userId, scheduleId, satelliteId, currentSchedule),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["useGetCommandsBySchedule"] });
      setCurrentSchedule([]);
    },

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
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "4rem",
        backgroundColor: "var(--material-theme-sys-dark-background)",
      }}>
      <h1 className="material-themedisplaymedium" style={{ width: "100%", color: "var(--material-theme-sys-light-secondary-container", marginLeft: "200px", marginTop: "50px"}}> 
      Satellite Names </h1>
     <Box style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "flex-start",}}>
        <Card
          sx={{
            minWidth: "200px",
            border: "2px solid white",
            borderRadius: "16px",
            padding: "10px",
            marginLeft: "250px",
            backgroundColor: "var(--material-theme-sys-dark-background)"
          }}>
          <h2 className="material-themedisplaysmall " style={{ width: "100%", color: "var(--material-theme-sys-light-secondary-container"}}>Valid Commands</h2>
            {validCommands &&
              validCommands.length > 0 &&
              validCommands.map((command, index) => (
                <Button
                  key={index}
                  className="scheduleButton"
                  onClick={() => addCommand(command)}
                  style = {{color: "var(--material-theme-sys-light-secondary-container)", fontFamily: "Roboto"}}>
                  {command}
                </Button>
              ))}
        </Card>
        <Card
          sx={{
            border: "2px solid white",
            borderRadius: "16px",
            padding: "10px",
            overflow: "auto",
            marginLeft: "220px",
            backgroundColor: "var(--material-theme-sys-dark-background)",
          }}>
          <h2 className="material-themedisplaysmall" style={{ width: "100%", color: "var(--material-theme-sys-light-secondary-container)"}}>Current Schedules</h2>
          {currentSchedule &&
            currentSchedule.length > 0 &&
            currentSchedule.map((command, index) => (
              <Button
                key={index}
                className="removeButton scheduleButton"
                onClick={() => removeCommand(index)}
                style = {{color: "var(--material-theme-sys-light-secondary-container)", fontFamily: "Roboto"}}>
                <Box className="buttonText" style= {{textAlign:"center"}}>{command}</Box>
                <Box className="closeButton">X</Box>
              </Button>
            ))}
            {/* need this div for clear formatting within the cards */}
          <div style={{ display: "flex", justifyContent: "space-around" }}> 
            <Button
              onClick={() => setCurrentSchedule([])}
              style={{ display: "block", margin: "5px 0", color: "var(--material-theme-sys-light-secondary-container)", fontFamily: "Roboto"}}>
              Clear Schedule
            </Button>
            <Button
              onClick={() => sendSchedule()}
              style={{ display: "block", margin: "5px 0",color: "var(--material-theme-sys-light-secondary-container)", fontFamily: "Roboto"}}>
              Send Schedule
            </Button>
          </div>
        </Card>
      </Box>
      <ViewScheduleCard scheduleId={scheduleId} userId={userId} />
    </Box>
  );
};

export default Scheduler;