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
import { useGetUserSatellites } from "@/constants/hooks";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  userId: string;
};

type SatelliteDetails = {
  name: string;
  noradId: string;
  satId: string;
};

const SatellitesOfInterest = ({ userId }: Props) => {
  const [open, setOpen] = useState(false);
  const [satelliteName, setSatelliteName] = useState("");
  const [noradId, setNoradId] = useState("");

  const satellites = useGetUserSatellites(userId);

  const queryClient = useQueryClient();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const addSatellite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await addNewSatellite(satelliteName, noradId, userId);
    } catch (error) {}

    await queryClient.invalidateQueries({ queryKey: ["useGetUserSatellites"] });

    handleClose();
  };

  console.log(satellites.data);

  return (
    <div className="satellitesOfInterest">
      <Stack alignItems="flex-start" spacing={1}>
        <UserName userName="65a5e14ee0d601e0e8c4a387" />
        <p className="headerBox">Saved Satellites</p>
        <Stack
          className="satellitesOfInterestBox"
          alignItems="flex-start"
          direction="row"
          spacing={5}>
          {satellites.data?.satellitesOfInterest?.satellites?.length &&
            satellites.data?.satellitesOfInterest.satellites.map(
              (satellite: any, index: number) => (
                <Grid item key={index} spacing={1}>
                  <Link href={`/satellite/${satellite._id}`} passHref>
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
                      }}>
                      <CardContent>
                        <p className="cardTitle">{satellite.name}</p>
                        <p className="cardSubtitle">{satellite.noradId}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </Grid>
              )
            )}
        </Stack>
        <IconButton
          onClick={handleClickOpen}
          sx={{
            size: "medium",
            backgroundColor:
              "var(--material-theme-sys-light-inverse-on-surface)",
            color: "var(--material-theme-black)",
            borderRadius: 20,
          }}>
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
