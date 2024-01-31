import React from 'react';
import '../components/Scheduler.css'; // Import the CSS styles

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
  return (
    <div className="schedule">
      <div className="schedule-header">
        {schedule.date} 
        <br> </br>
        {schedule.startTime} - {schedule.endTime}
      </div>
      <ul className="commands">
        {schedule.commands.map((command, index) => (
          <li key={index}>{command.name}</li>
        ))}
      </ul>
    </div>
  );
};

const SchedulesPage: React.FC = () => {
  return (
    <div className="schedules-page">
      <header>
        <div className='satellite-name'>
          Satellite Name
        </div>
      </header>
      <div className="schedule-queue">
        {schedules.map((schedule, index) => (
          <ScheduleComponent key={index} schedule={schedule} />
        ))}
      </div>
      <button className="add-schedule">+</button>
    </div>
  );
};

export default SchedulesPage;

