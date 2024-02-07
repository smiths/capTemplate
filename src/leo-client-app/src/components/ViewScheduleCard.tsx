import { removeCommandFromSchedule } from "@/constants/api";
import { useGetCommandsBySchedule } from "@/constants/hooks";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type Props = {
  scheduleId: string;
  userId: string;
};

const ViewScheduleCard: React.FC<Props> = ({ scheduleId, userId }) => {
  const commandsData = useGetCommandsBySchedule(scheduleId);
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  // Mutation function
  const { mutate } = useMutation({
    mutationFn: (values: any) =>
      removeCommandFromSchedule(values.commandId, values.userId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["useGetCommandsBySchedule"] });
    },

    onError: () => {
      setError("Invalid permissions");
      queryClient.invalidateQueries({ queryKey: ["useGetCommandsBySchedule"] });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["useGetCommandsBySchedule"] });
    },
  });

  const removeCommand = async (commandId: string) => {
    setError("");
    mutate({ commandId, userId });
  };

  useEffect(() => {
    setError("");
  }, [commandsData.data]);

  return (
    <div
      style={{
        minWidth: "200px",
        border: "2px solid white",
        borderRadius: "16px",
        padding: "10px",
      }}>
      <h2>Current Schedule</h2>
      {error && <h3 style={{ color: "red" }}>{error}</h3>}
      <br></br>
      <TableContainer
        component={Paper}
        sx={{
          maxWidth: 800,
          background: "#40403fb0",
        }}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "white !important" }} align="left">
                Command
              </TableCell>
              <TableCell sx={{ color: "white !important" }} align="left">
                Status
              </TableCell>
              <TableCell sx={{ color: "white !important" }} align="left">
                Operator
              </TableCell>
              <TableCell sx={{ color: "white !important" }} align="left">
                Created
              </TableCell>
              <TableCell sx={{ color: "white !important" }} align="left">
                Delete
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {commandsData.data?.commands &&
              commandsData.data.commands.length > 0 &&
              commandsData.data.commands.map((item: any, index: number) => (
                <TableRow
                  key={item._id + index}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}>
                  <TableCell
                    sx={{ color: "white !important" }}
                    align="left"
                    component="th"
                    scope="row">
                    {item.command}
                  </TableCell>
                  <TableCell sx={{ color: "white !important" }} align="left">
                    {item.status}
                  </TableCell>
                  <TableCell sx={{ color: "white !important" }} align="left">
                    {item.userId.email}
                  </TableCell>
                  <TableCell sx={{ color: "white !important" }} align="left">
                    {new Date(item.createdAt.toString()).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        second: "numeric",
                      }
                    )}
                  </TableCell>
                  <TableCell sx={{ color: "white !important" }} align="left">
                    <Button
                      variant="text"
                      sx={{ color: "red" }}
                      onClick={() => removeCommand(item._id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ViewScheduleCard;
