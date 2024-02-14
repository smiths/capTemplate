// import React from 'react';
// // import './EditSchedulePage.css'; // Your stylesheet filename

// interface Command {
//   id: number;
//   name: string;
//   operator: string;
//   created: string;
// }

// // Example commands data
// const commands: Command[] = [
//   { id: 1, name: 'setUp', operator: 'operator1', created: 'Jan 1 2023' },
//   { id: 2, name: 'runDiagnostics', operator: 'operator1', created: 'Jan 1 2023' },
//   { id: 3, name: 'checkSensor', operator: 'operator1', created: 'Jan 1 2023' },
//   { id: 4, name: 'loadData', operator: 'operator2', created: 'Jan 2 2023' },
//   { id: 5, name: 'tearDown', operator: 'operator1', created: 'Jan 1 2023' },
//   // ... more commands
// ];

// const EditSchedulePage: React.FC = () => {
//   return (
//     <div className="edit-schedule-page">
//       <div className="header">
//         <button className="back-button">{"<"}</button>
//         <h2>Edit Schedule</h2>
//         <button className="close-button">{"X"}</button>
//       </div>
//       <h3>Jan 09 Schedule</h3>
//       <table>
//         <thead>
//           <tr>
//             <th>id</th>
//             <th>Command</th>
//             <th>Operator</th>
//             <th>Created</th>
//           </tr>
//         </thead>
//         <tbody>
//           {commands.map(command => (
//             <tr key={command.id}>
//               <td>{command.id}</td>
//               <td>{command.name}</td>
//               <td>{command.operator}</td>
//               <td>{command.created}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <div className="actions">
//         <button className="add-command">add new command</button>
//         <button className="see-logs">see logs</button>
//       </div>
//       <div className="footer">
//         <button className="save-button">Save</button>
//         <button className="cancel-button">Cancel</button>
//       </div>
//     </div>
//   );
// };

// export default EditSchedulePage;

import '../components/Scheduler.css'; // Import the CSS styles
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import EditSchedulePage from "@/components/EditSchedules";
import { useRouter } from "next/router";


import { sendCommandSchedule } from "@/constants/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import ViewScheduleCard from "./ViewScheduleCard";
import { color } from 'd3';
//import './EditSchedulePage.css'; // Your stylesheet filename




const Scheduler: React.FC = () => {
  const queryClient = useQueryClient();
  const router = useRouter();


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
      <h1> Satellite Name </h1>

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


export default Scheduler;
