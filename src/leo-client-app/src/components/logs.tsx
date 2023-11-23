"use client";
import { useGetAllOperators } from "@/constants/hooks";
import {
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

const Logs: React.FC = () => {

  // TODO: Dynamicall get satelliteId from somewhere
  const satelliteId = "655acd63d122507055d3d2ea";
  const [logs, setLogs] = useState([]);
  const [openLog, setOpenLog] = useState<boolean>(false);
//   const [currentSchedule, setCurrentSchedule] = useState<string[]>([]);

const handleLogOpen = () => {
    // setUserToEdit(null);
    setOpenLog(true);
  };

  const handleLogClose = () => {
    // setUserToEdit(null);
    setOpenLog(false);
  };

  const fetchLogs = (satelliteId: string) => {
    fetch(`http://localhost:3001/satellite/getLogs?satelliteId=${satelliteId}`)
      .then((response) => response.json())
      .then(data => {
        setLogs(data);
      })
      .catch((error) => {
        console.error("Error fetching satellite logs:", error);
      }); 
  };

//   const addCommand = (command : string) => {
//     setCurrentSchedule(prevCommands => [...prevCommands, command]);
//   };

//   const removeCommand = (index: number) => {
//     setCurrentSchedule(currentSchedule => currentSchedule.filter((_, i) => i !== index));
//   };

  // Function will load schedule somewhere, currently console log for POC demo
//   const sendSchedule = () => {
//     console.log(currentSchedule)
//     setCurrentSchedule([])
//   }

  useEffect(() => {
    fetchLogs(satelliteId);
  }, [satelliteId]);

    return (
        <Stack sx={{ width: "100%" }} alignItems="center" spacing={3} py={5}>
        <Typography variant="h5">Logs</Typography>
        <TableContainer
          component={Paper}
          sx={{
            maxWidth: 800,
            background: "#40403fb0",
          }}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "white !important" }} align="left">
                  Created At
                </TableCell>
                <TableCell sx={{ color: "white !important" }} align="left">
                  Last Updated
                </TableCell>
                <TableCell sx={{ color: "white !important" }} align="left">
                  Logs
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs &&
                logs.map((data: any, index: number) => (
                  <TableRow
                    key={data._id + index}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}>
                    <TableCell
                      sx={{ color: "white !important" }}
                      align="left"
                      component="th"
                      scope="row">
                      {data.createdAt}
                    </TableCell>
                    <TableCell sx={{ color: "white !important" }} align="left">
                      {data.updatedAt}
                    </TableCell>
                    <TableCell sx={{ color: "white !important" }} align="left">
                      <Button
                        variant="text"
                        sx={{ color: "#6cb6ff" }}
                        onClick={() => handleLogOpen()}>
                        Show Logs
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* <EditUserRoleModal
          open={openLog}
        //   userData={userToEdit}
          handleClose={handleLogClose}
        /> */}
      </Stack>
    );
  };
  
export default Logs;
