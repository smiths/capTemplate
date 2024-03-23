"use client";

import {
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import Link from "next/link";
import axios from "axios";
import React, { useEffect, useState } from "react";
import "../styles.css";
import "./styles/satellitesOfInterest.css";
import "./styles/component.css";
import UserName from "./UserName";
import { addNewSatellite, BACKEND_URL } from "@/constants/api";

type Props = {
  userId: string;
};

type SatelliteDetails = {
  name: string;
  noradId: string;
  satId: string;
};

const SatellitesOfInterest = ({ userId }: Props) => {
  const [satellites, setSatellites] = useState<SatelliteDetails[]>([]);
  const [open, setOpen] = useState(false);
  const [satelliteName, setSatelliteName] = useState("");
  const [noradId, setNoradId] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const fetchSatellites = async (satelliteId: string) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/satellite/getSatellite`,
        {
          params: { satelliteId: satelliteId },
        }
      );

      return {
        name: response.data.satellite.name,
        noradId: response.data.satellite.noradId,
        satId: response.data.satellite._id,
      };
    } catch (error) {
      console.error("Error fetching satellite name:", error);
      return "";
    }
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/users/getUserSatellites`, {
        params: { userId: userId },
      });
      const satelliteIds = res.data.satellitesOfInterest;
      const satelliteNamesPromises = satelliteIds.map((satelliteId: string) =>
        fetchSatellites(satelliteId)
      );
      const satellites = await Promise.all(satelliteNamesPromises);
      setSatellites(satellites);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addSatellite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Satellite Name:", satelliteName, "NORAD ID:", noradId);
    const newSatellite = {
      name: satelliteName,
      noradId,
      satId: "newId",
    };
    setSatellites([...satellites, newSatellite]);
    await addNewSatellite(satelliteName, noradId);
    handleClose();
  };

  return (
    <div className="satellitesOfInterest">
      <Stack alignItems="flex-start" spacing={1}>
        <UserName userName="leo" />
        <p className="headerBox"></p>
        <Stack
          className="satellitesOfInterestBox"
          alignItems="flex-start"
          direction="row"
          spacing={5}
        >
          {satellites.map((satellite, index) => (
            <Grid item key={index} spacing={1}>
              <Link href={`/satellite/${satellite.satId}`} passHref>
                <Card
                  sx={{
                    minWidth: 150,
                    maxWidth: 150,
                    margin: 0.5,
                    backgroundColor:
                      "var(--material-theme-sys-light-inverse-on-surface)",
                    cursor: "pointer",
                    borderRadius: 3,
                    minHeight: 150,
                    maxHeight: 150,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    marginLeft: 2,
                    marginRight: 2,
                  }}
                >
                  <CardContent>
                    <p className="cardTitle">{satellite.name}</p>
                    <p className="cardSubtitle">{satellite.noradId}</p>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Stack>
        <IconButton
          onClick={handleClickOpen}
          sx={{
            size: "medium",
            backgroundColor:
              "var(--material-theme-sys-light-inverse-on-surface)",
            color: "var(--material-theme-black)",
            borderRadius: 20,
          }}
        >
          Add Custom Satellite +{" "}
        </IconButton>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Add New Satellite</DialogTitle>
          <form onSubmit={addSatellite}>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Satellite Name"
                type="text"
                fullWidth
                variant="standard"
                value={satelliteName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSatelliteName(e.target.value)
                }
                required
              />
              <TextField
                margin="dense"
                id="noradId"
                label="NORAD ID"
                type="number"
                fullWidth
                variant="standard"
                value={noradId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNoradId(e.target.value)
                }
                required
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit">Submit</Button>
            </DialogActions>
          </form>
        </Dialog>
      </Stack>
    </div>
  );
};

export default SatellitesOfInterest;
