import React from 'react';
import '../components/Scheduler.css'; // Import the CSS styles
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import EditSchedulePage from "@/components/EditSchedules";


import { sendCommandSchedule } from "@/constants/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import ViewScheduleCard from "./ViewScheduleCard";

const Scheduler: React.FC = () => {
  const queryClient = useQueryClient();

  // TODO: Dynamicall get satelliteId from somewhere
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "4rem",
      }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "flex-start",
        }}>
        <div
          style={{
            minWidth: "200px",
            border: "2px solid white",
            borderRadius: "16px",
            padding: "10px",
          }}>
          <h2>Valid Commands</h2>
          <div>
            {validCommands &&
              validCommands.length > 0 &&
              validCommands.map((command, index) => (
                <button
                  key={index}
                  className="scheduleButton"
                  onClick={() => addCommand(command)}>
                  {command}
                </button>
              ))}
          </div>
        </div>

        <div style={{ width: "50px" }}></div>

        <div
          style={{
            border: "2px solid white",
            borderRadius: "16px",
            padding: "10px",
            overflow: "auto",
          }}>
          <h2>Current Schedule</h2>
          {currentSchedule &&
            currentSchedule.length > 0 &&
            currentSchedule.map((command, index) => (
              <button
                key={index}
                className="removeButton scheduleButton"
                onClick={() => removeCommand(index)}>
                <span className="buttonText">{command}</span>
                <span className="closeButton">X</span>
              </button>
            ))}
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <button
              onClick={() => setCurrentSchedule([])}
              style={{ display: "block", margin: "5px 0" }}>
              Clear Schedule
            </button>
            <button
              onClick={() => sendSchedule()}
              style={{ display: "block", margin: "5px 0" }}>
              Send Schedule
            </button>
          </div>
        </div>
      </div>
      <ViewScheduleCard scheduleId={scheduleId} userId={userId} />
    </div>
  );
};

// const ScheduleComponent: React.FC<{ schedule: Schedule }> = ({ schedule }) => {
  

const SchedulesPage: React.FC = () => {
  return (
    <div className="schedules-page">
      {/* this is for satellite name title; for now its being hardcoded later on it will be dynamic (another pr) */}
      <header> 
        <div className='satellite-name'>
          Satellite Name
        </div>
      </header>
      {/* All schedules for that particular satellite */}
      <header>
        <div className='all-schedules'>
            All Schedules
          </div>
      </header>
      <header> 
        <div className='schedule-queue'> 
      Schedule Queue
        </div> 
      </header>
  
      <div className="schedule-queue">
        {schedules.map((schedule, index) => (
          <ScheduleComponent key={index} schedule={schedule} />
        ))}
        {/* button for edit schedules */}
      </div>
      <button className="add-schedule">+</button>
      
      

    </div>
    
   
  );
};

export default SchedulesPage;

