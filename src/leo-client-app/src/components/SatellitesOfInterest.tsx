"use client";

import { Card, CardContent, Grid, Stack,TextField, Button, IconButton, Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle, } from "@mui/material";
import Link from "next/link";
import axios from "axios";
import React, { useEffect, useState } from "react";
import "../styles.css";
import "./styles/satellitesOfInterest.css";
import "./styles/component.css";
import UserName from "./UserName";
import {addNewSatellite, BACKEND_URL } from "@/constants/api";

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
  // const [showForm, setShowForm] = useState(false); // State to toggle form visibility
  // const [satelliteName, setSatelliteName] = useState(''); // State for the input field value
  const [open, setOpen] = useState(false);
  const [satelliteName, setSatelliteName] = useState('');
  const [noradId, setNoradId] = useState('');

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


  const addSatellite = async (e) => {
    e.preventDefault();
    console.log('Satellite Name:', satelliteName, 'NORAD ID:', noradId);
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
        <UserName userName="65a5e14ee0d601e0e8c4a387" />
        <p className="headerBox">Saved Satellites</p>
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
      <IconButton variant="contained" onClick={handleClickOpen} sx={{size: 'medium', backgroundColor: "var(--material-theme-sys-light-inverse-on-surface)", color: "var(--material-theme-black)", borderRadius: 20}}> 
      Add Custom Satellite + </IconButton>
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
              onChange={(e) => setSatelliteName(e.target.value)}
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
              onChange={(e) => setNoradId(e.target.value)}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" onClick={addSatellite}>Submit</Button>
          </DialogActions>
        </form>
      </Dialog>

      
      </Stack>
    </div>
  );
};

export default SatellitesOfInterest;



  // const handleInputChange = (e) => {
  //   setSatelliteName(e.target.value);
  // };

  // // Handler for form submission
  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   // Process the input (e.g., call an API or update state)
  //   console.log('Satellite Name:', satelliteName);
  //   // Optionally hide the form again
  //   setShowForm(false);
  //   // Reset the input field
  //   setSatelliteName('');
  // };

  // const addSatellite = async () => {
  //   const newSatellite = {
  //     name: "New Satellite",
  //     noradId: "00000",
  //     satId: "newId",
  //   };
  //   setSatellites([...satellites, newSatellite]);
  //   // await addNewSatellite(name, noradId);
  // };



   {/* <IconButton variant="contained" onClick={addSatellite} sx={{size: 'medium', backgroundColor: "var(--material-theme-sys-light-inverse-on-surface)", color: "var(--material-theme-black)", borderRadius: 20}}> Add Custom Satellite + </IconButton> */}
        {/* <Button sx ={{backgroundColor: "var(--material-theme-sys-light-inverse-on-surface)", color: "var(--material-theme-white)"}} variant="contained" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Add New Custom Satellite'}
      </Button>
      {showForm && (
        <form onSubmit={handleSubmit}>
          <Stack spacing={2} marginTop={2}>
            <TextField
            sx={{
              '& label.Mui-focused': {
                color: 'white',
              },
              '& .MuiInput-underline:after': {
                borderBottomColor: 'white',
              },
              '& .MuiInputBase-input': {
                color: 'white', // Change input text color
              },
            }}
              label="Satellite Name"
              value={satelliteName}
              onChange={handleInputChange}
              required
            />
            <Button type="submit" variant="contained">
              Submit
            </Button>
          </Stack>
        </form>
      )} */}