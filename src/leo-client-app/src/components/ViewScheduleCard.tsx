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
  Box
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ForkLeft } from "../../../../../node_modules/@mui/icons-material/index";
import '../styles.css';

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
    <Box
      style={{
        minWidth: "200px",
        padding: "10px",
        marginLeft: "80px",
        marginTop: "80px",
        marginBottom: "20px" }}>
      <h2 className="material-themedisplaysmall " style={{ width: "100%", color: "var(--material-theme-sys-light-secondary-container", marginLeft: "500px", marginBottom: "8px" }}>Current Schedule</h2>
      {error && <h3 style={{ color: "red" }}>{error}</h3>}
      <br></br>
      <TableContainer
        component={Paper}
        sx={{
          minWidth: 1000,
          background: "var(--material-theme-sys-dark-primary-fixed)",
          marginLeft: "110px"
        }}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "black !important", borderLeft: 2, borderRight: 2 }} align="left">
                Command
              </TableCell>
              <TableCell sx={{ color: "black !important", borderRight: 2}} align="left">
                Status
              </TableCell>
              <TableCell sx={{ color: "black !important", borderRight: 2}} align="left">
                Operator
              </TableCell>
              <TableCell sx={{ color: "black !important", borderRight: 2 }} align="left">
                Created
              </TableCell>
              <TableCell sx={{ color: "black !important", borderRight: 2}} align="left">
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
                  sx={{ borderBottom: 2, borderTop: 2, borderLeft: 2,borderRight: 2
                    // "&:last-child td, &:last-child th": { border: 1 },
                  }}>
                  <TableCell
                    sx={{ color: "black !important", borderRight: 2 }}
                    align="left"
                    component="th"
                    scope="row">
                    {item.command}
                  </TableCell>
                  <TableCell sx={{ color: "black !important", borderRight: 2}} align="left">
                    {item.status}
                  </TableCell>
                  <TableCell sx={{ color: "black !important", borderRight: 2 }} align="left">
                    {item.userId.email}
                  </TableCell>
                  <TableCell sx={{ color: "black !important", borderRight: 2 }} align="left">
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
                      disabled={item.status === "EXECUTED"}
                      onClick={() => removeCommand(item._id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ViewScheduleCard;
