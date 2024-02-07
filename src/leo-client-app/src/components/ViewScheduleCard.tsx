import { useGetCommandsBySchedule } from "@/constants/hooks";

type Props = {
  scheduleId: string;
};

const ViewScheduleCard: React.FC<Props> = ({ scheduleId }) => {
  const commandsData = useGetCommandsBySchedule(scheduleId);

  const removeCommand = (commandId: string) => {};

  return (
    <div
      style={{
        minWidth: "200px",
        border: "2px solid white",
        borderRadius: "16px",
        padding: "10px",
      }}>
      <h2>Current Schedule</h2>
      <div>
        {commandsData.data?.commands &&
          commandsData.data.commands.length > 0 &&
          commandsData.data.commands.map((item: any, index: number) => (
            <button
              key={item._id + index}
              className="scheduleButton"
              onClick={() => removeCommand(item.id)}>
              {item.command}
            </button>
          ))}
      </div>
    </div>
  );
};

export default ViewScheduleCard;
