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
} from "@mui/material";
import "./styles/satelliteCommands.css"
import axios from "axios";
import SatelliteName from "./SatelliteName";

const SatelliteCommands: React.FC = () => {
  const router = useRouter();
  const satId = router.query?.satId?.toString() ?? "655acd63d122507055d3d2ea";
  const [satelliteName, setSatelliteName] = useState<string>();
  const [validCommands, setValidCommands] = useState<string[]>([]);
  const [editingCommand, setEditingCommand] = useState<string | null>(null);
  const [updatedCommands, setUpdatedCommands] = useState<string[] | null>(null);

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

  useEffect(() => {
    fetchName();
    fetchValidCommands(satId);
  }, [satId]);

  return (
    <div className="satelliteCommands">
      <SatelliteName satelliteName={satelliteName as string} />
      <h1>Satellite Commands</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const target = e.target as HTMLFormElement;
          addCommands(
            (target.elements.namedItem("newCommands") as HTMLInputElement).value
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
      <Table component="table">
        <TableBody>
          {updatedCommands?.map((command, index) => (
            <TableRow key={index}>
              <TableCell sx={{ color: "white" }}>{command}</TableCell>
              <TableCell sx={{ color: "white" }}>
                {editingCommand === command ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const target = e.target as HTMLFormElement;
                      updateCommand(
                        command,
                        (
                          target.elements.namedItem(
                            "command"
                          ) as HTMLInputElement
                        ).value
                      );
                    }}
                  >
                    <Input
                      name="command"
                      defaultValue={command}
                      sx={{ color: "white" }}
                    />
                    <Button type="submit" sx={{ color: "white" }}>
                      Save
                    </Button>
                  </form>
                ) : (
                  <>
                    <Button onClick={() => setEditingCommand(command)}>
                      Edit
                    </Button>
                    <Button onClick={() => deleteCommand(command)}>
                      Delete
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SatelliteCommands;
