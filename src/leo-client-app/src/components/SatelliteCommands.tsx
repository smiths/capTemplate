"use client";

import React, { useEffect, useState } from "react";
import "../styles.css";
import { BACKEND_URL } from "@/constants/api";
import { useRouter } from "next/router";
import {
  Table,
  Button,
  Input,
  TableBody,
  TableCell,
  TableRow,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableHead,
} from "@mui/material";
import "./styles/satelliteCommands.css";
import axios from "axios";
import SatelliteName from "./SatelliteName";

const SatelliteCommands: React.FC = () => {
  const router = useRouter();
  const satId = router.query?.satId?.toString() ?? "655acd63d122507055d3d2ea";
  const [satelliteName, setSatelliteName] = useState<string>();
  const [validCommands, setValidCommands] = useState<string[]>([]);
  const [editingCommand, setEditingCommand] = useState<string | null>(null);
  const [updatedCommands, setUpdatedCommands] = useState<string[] | null>(null);
  const [open, setOpen] = useState(false);
  const [currentCommand, setCurrentCommand] = useState("");

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

  const fetchValidCommands = async (satId: string) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/satellite/getSatellite?satelliteId=${satId}`
      );
      const data = await response.json();
      setValidCommands(data.satellite.validCommands);
      setUpdatedCommands(data.satellite.validCommands);
    } catch (error) {
      console.error("Error fetching valid commands Admin:", error);
    }
  };

  const updateValidCommandsInDb = async (commandsToUpdate: any) => {
    try {
      await axios.patch(
        `${BACKEND_URL}/satellite/updateSatelliteTargetCommands`,
        { validCommands: commandsToUpdate },
        { params: { id: satId } }
      );
    } catch (error) {
      console.error("Error updating commands:", error);
    }
  };

  const addCommands = (newCommands: string) => {
    const commands = newCommands.split(",").map((command) => command.trim());
    setUpdatedCommands((prevCommands) => {
      const updated = [...(prevCommands || []), ...commands];
      updateValidCommandsInDb(updated);
      return updated;
    });
  };

  const updateCommand = (oldCommand: string, newCommand: string) => {
    setUpdatedCommands((prevCommands) => {
      const updated = (prevCommands || []).map((command) =>
        command === oldCommand ? newCommand : command
      );
      setEditingCommand(null);
      updateValidCommandsInDb(updated);
      return updated;
    });
  };

  const deleteCommand = (command: string) => {
    setUpdatedCommands((prevCommands) => {
      const updated = prevCommands?.filter((c) => c !== command) ?? null;
      updateValidCommandsInDb(updated);
      return updated;
    });
  };

  const handleClickOpen = (command: string) => {
    setCurrentCommand(command);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    fetchName();
    fetchValidCommands(satId);
  }, [satId]);

  return (
    <div className="satelliteCommands">
      <Stack className="stack" style={{ width: "100%" }} spacing={3} py={8}>
        <SatelliteName satelliteName={satelliteName as string} />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const target = e.target as HTMLFormElement;
            addCommands(
              (target.elements.namedItem("newCommands") as HTMLInputElement)
                .value
            );
          }}
        >
          <Input
            name="newCommands"
            placeholder="Enter new commands, separated by commas"
            sx={{ color: "white" }}
          />
          <Button type="submit" sx={{ color: "white" }}>
            Add Commands
          </Button>
        </form>
        <div
          className="commandsBox"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <Table
            component="table"
            sx={{
              maxWidth: "50%",
              borderCollapse: "collapse",
              backgroundColor: "var(--material-theme-sys-light-primary-fixed)",
            }}
          >
            <TableHead>
              <TableRow
                sx={{ borderBottom: "2px solid var(--material-theme-black)" }}
              >
                <TableCell
                  sx={{
                    color: "var(--material-theme-black)",
                    width: "auto",
                  }}
                >
                  Command
                </TableCell>
                <TableCell
                  sx={{
                    color: "var(--material-theme-black)",
                    width: "auto",
                    textAlign: "right",
                    paddingRight: "80px",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {updatedCommands?.map((command, index) => (
                <TableRow
                  key={index}
                  sx={{ borderBottom: "2px solid var(--material-theme-black)" }}
                >
                  <TableCell
                    sx={{
                      color: "var(--material-theme-black)",
                      width: "auto",
                    }}
                  >
                    {command}
                  </TableCell>
                  <TableCell>
                    <div
                      style={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      <Button
                        onClick={() => handleClickOpen(command)}
                        style={{ marginRight: "40px" }}
                      >
                        Edit
                      </Button>
                      <Button onClick={() => deleteCommand(command)}>
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Stack>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle
          sx={{
            backgroundColor: "var(--material-theme-sys-light-primary-fixed)",
          }}
        >
          Edit Command
        </DialogTitle>
        <DialogContent
          sx={{
            backgroundColor: "var(--material-theme-sys-light-primary-fixed)",
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const target = e.target as HTMLFormElement;
              updateCommand(
                currentCommand,
                (target.elements.namedItem("command") as HTMLInputElement).value
              );
              handleClose();
            }}
          >
            <Input
              name="command"
              defaultValue={currentCommand}
              sx={{ color: "black" }}
            />
            <DialogActions>
              <Button type="submit" sx={{ color: "black" }}>
                Save
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SatelliteCommands;
