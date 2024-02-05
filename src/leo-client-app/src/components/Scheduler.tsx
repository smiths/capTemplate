import React from 'react';
import '../components/Scheduler.css'; // Import the CSS styles
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import EditSchedulePage from "@/components/EditSchedules";
import { useRouter } from "next/router";


interface Command {
  name: string;
}

interface Schedule {
  date: string;
  startTime: string;
  endTime: string;
  commands: Command[];
}

// Mock data
const schedules: Schedule[] = [
  {
    date: "Jan 9 2024",
    startTime: "9:10 AM",
    endTime: "9:12 AM",
    commands: [
      { name: "Setup" },
      { name: "Command 1" },
      { name: "Command 2" },
      { name: "Command 3" },
      { name: "Teardown" },
    ],
  },
  {
    date: "Jan 9 2024",
    startTime: "9:10 AM",
    endTime: "9:12 AM",
    commands: [
      { name: "Setup" },
      { name: "Command 1" },
      { name: "Command 2" },
      { name: "Command 3" },
      { name: "Teardown" },
    ],
  },
  {
    date: "Jan 9 2024",
    startTime: "9:10 AM",
    endTime: "9:12 AM",
    commands: [
      { name: "Setup" },
      { name: "Command 1" },
      { name: "Command 2" },
      { name: "Command 3" },
      { name: "Teardown" },
    ],
  },
  // ... more schedules
];

const ScheduleComponent: React.FC<{ schedule: Schedule }> = ({ schedule }) => {
const { pathname, replace } = useRouter();

  // let navigate = useNavigate();

  // const handleEditClick = () => {
  //   navigate('/edit-schedules/index.tsx');
  // };
  return (
    <div className="schedule">
      <div className="schedule-header">
        {schedule.date} 
        <br/>
        {schedule.startTime} - {schedule.endTime}
      </div>
      <ul className="commands">
        {schedule.commands.map((command, index) => (
          <li key={index}>{command.name}</li>
        ))}
      </ul>
      <button className="edit-button" onClick={() => {replace("/edit-schedules")}}>Edit</button>
     {/* <button className="edit-button" onClick={handleEditClick}>Edit</button>  */}
      


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

