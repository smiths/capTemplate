"use client";
import React, { useEffect, useState } from "react";
import { Button, Paper, Stack, Typography, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LogDialog from "./logModal";
import moment from "moment";


const Logs: React.FC = () => {

  // TODO: Dynamicall get satelliteId from somewhere
  const satelliteId = "655acd63d122507055d3d2ea";
  const [logs, setLogs] = useState<any>([]);
  const [logData, setLogData] = useState<any>(null);
  const [openLog, setOpenLog] = useState<boolean>(false);
const handleLogOpen = (logData: any) => {
    setLogData(logData);
    setOpenLog(true);
  };

  const handleLogClose = () => {
    setOpenLog(false);
  };

  const fetchLogs = (satelliteId: string) => {
    fetch(`http://localhost:3001/log/getLogsBySatellite?satelliteId=${satelliteId}`)
      .then((response) => response.json())
      .then(data => {
        setLogs(data?.logs??[]);
        console.log(data);
      })
      .catch((error) => {
        console.error("Error fetching satellite logs:", error);
      }); 
  };


  useEffect(() => {
    fetchLogs(satelliteId);
  }, [satelliteId]);

    return (

    <Box sx={{ width: "100%", bgcolor: "#121212", minHeight: "100vh", color: "white" }}>
       <Stack sx={{ width: "100%" }} alignItems="center" spacing={3} py={5}>
        <Typography variant="h4" gutterBottom>
          All Logs
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Logs per Schedule
        </Typography>
        {logs.map((log: any, index: number) => (
          <Paper
            key={log._id}
            sx={{
              bgcolor: "#252525",
              p: 2,
              mb: 2,
              width: "80%",
              maxWidth: "800px"
            }}
          >
            <Typography variant="subtitle2">
              {moment.utc(log.createdAt).local().format("MMM D YYYY")}
              <br />
              {moment.utc(log.createdAt).local().format("h:mm A")} -{" "}
              {moment.utc(log.updatedAt).local().format("h:mm A")}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              log preview
            </Typography>
            <Button
              variant="text"
              sx={{ color: "white", mt: 1 }}
              onClick={() => handleLogOpen(log)}
            >
              Show Logs
            </Button>
          </Paper>
        ))}
        <Button
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            bgcolor: "pink",
            '&:hover': {
              bgcolor: "pink", // theme.palette.error.main
              opacity: [0.9, 0.8, 0.7],
            },
            color: "white",
            borderRadius: "50%",
            minWidth: "56px",
            height: "56px"
          }}
          onClick={() => {/* handle add new log */}}
        >
        {/* <AddIcon /> */}
        </Button>
        <LogDialog
          open={openLog}
          logData={logData}
          handleClose={handleLogClose}
        />
      </Stack>
    </Box>
      
    );
  };
  
export default Logs;
