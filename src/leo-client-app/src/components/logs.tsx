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
import LogDialog from "./LogModal";
import "./styles/logs.css";
import "../styles.css";
import moment from "moment";
import { BACKEND_URL } from "@/constants/api";
import { useRouter } from "next/router";

type Props = {
  satelliteId: string;
};

const Logs: React.FC = () => {
  const router = useRouter();
  let { satId } = router.query as {
    satId: string;
  };
  if (!satId) {
    satId = "655acd63d122507055d3d2ea";
  }

  const satelliteId = satId;
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
    fetch(`${BACKEND_URL}/log/getLogsBySatellite?satelliteId=${satelliteId}`)
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
    <div className="logs">
      <Stack className="stack" style={{ width: "100%" }} spacing={3} py={8}>
        <Typography variant="h4">Logs</Typography>
        <div className="logsBox">
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
                          sx={{
                            color: "var(--material-theme-sys-dark-on-primary)",
                            backgroundColor:
                              "var(--material-theme-sys-dark-primary)",
                            borderRadius: "10px",
                          }}
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
        </div>
      </Stack>
    </div>
  );
};

export default Logs;
