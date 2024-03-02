"use client";

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
import LogDialog from "./logModal";
import "./styles/logs.css";
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
    fetch(
      `http://localhost:3001/log/getLogsBySatellite?satelliteId=${satelliteId}`
    )
      .then((response) => response.json())
      .then((data) => {
        setLogs(data?.logs ?? []);
      })
      .catch((error) => {
        console.error("Error fetching satellite logs:", error);
      });
  };

  useEffect(() => {
    fetchLogs(satelliteId);
  }, [satelliteId]);

  return (
    <div className="logsBox">
      <Stack className="stack" alignItems="flex-start" spacing={3} py={8}>
        <Typography variant="h5">Logs</Typography>
        <TableContainer
          component={Paper}
          sx={{
            maxWidth: 800,
            background: "var(--material-theme-sys-light-primary-fixed)",
            '& .MuiTableCell-root': {  // This targets all TableCell components
              borderBottom: "2px solid black",
            },
          }}
        >
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell className="table-cell">Created At</TableCell>
                <TableCell className="table-cell">Last Updated</TableCell>
                <TableCell className="table-cell">Logs</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs &&
                logs?.map((data: any, index: number) => (
                  <TableRow key={data._id + index} className="table-row">
                    <TableCell
                      className="table-cell"
                      component="th"
                      scope="row"
                    >
                      {moment
                        .utc(data.createdAt)
                        .local()
                        .format("DD/MM/YYYY HH:mm:ss")}
                    </TableCell>
                    <TableCell className="table-cell">
                      {moment
                        .utc(data.updatedAt)
                        .local()
                        .format("DD/MM/YYYY HH:mm:ss")}
                    </TableCell>
                    <TableCell className="table-cell">
                      <Button
                        variant="text"
                        className="button"
                        onClick={() => handleLogOpen(data)}
                      >
                        Show Logs
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <LogDialog
          open={openLog}
          logData={logData}
          handleClose={handleLogClose}
        />
      </Stack>
    </div>
  );
};

export default Logs;
