import React from 'react';
import './EditSchedulePage.css'; // Your stylesheet filename

interface Command {
  id: number;
  name: string;
  operator: string;
  created: string;
}

// Example commands data
const commands: Command[] = [
  { id: 1, name: 'setUp', operator: 'operator1', created: 'Jan 1 2023' },
  { id: 2, name: 'runDiagnostics', operator: 'operator1', created: 'Jan 1 2023' },
  { id: 3, name: 'checkSensor', operator: 'operator1', created: 'Jan 1 2023' },
  { id: 4, name: 'loadData', operator: 'operator2', created: 'Jan 2 2023' },
  { id: 5, name: 'tearDown', operator: 'operator1', created: 'Jan 1 2023' },
  // ... more commands
];

const EditSchedulePage: React.FC = () => {
  return (
    <div className="edit-schedule-page">
      <div className="header">
        <button className="back-button">{"<"}</button>
        <h2>Edit Schedule</h2>
        <button className="close-button">{"X"}</button>
      </div>
      <h3>Jan 09 Schedule</h3>
      <table>
        <thead>
          <tr>
            <th>id</th>
            <th>Command</th>
            <th>Operator</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {commands.map(command => (
            <tr key={command.id}>
              <td>{command.id}</td>
              <td>{command.name}</td>
              <td>{command.operator}</td>
              <td>{command.created}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="actions">
        <button className="add-command">add new command</button>
        <button className="see-logs">see logs</button>
      </div>
      <div className="footer">
        <button className="save-button">Save</button>
        <button className="cancel-button">Cancel</button>
      </div>
    </div>
  );
};

export default EditSchedulePage;
