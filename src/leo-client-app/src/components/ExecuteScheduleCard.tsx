import { removeCommandFromSchedule } from "@/constants/api";
import { useGetCommandsBySchedule } from "@/constants/hooks";
import {
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const ExecuteScheduleCard = () => {
  const router = useRouter();

  const userId: string = "65a8181f36ea10b4366e1dd9";
  const scheduleId = router.query?.scheduleId?.toString() ?? "";

  const commandsData = useGetCommandsBySchedule(scheduleId);
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const executeSchedule = () => {
    setIsExecuting(!isExecuting);
  };

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
    <Stack sx={{ width: "100%" }} alignItems="center" spacing={4} py={10}>
      <Typography
        align="center"
        variant="h3"
        style={{
          width: "100%",
          color: "var(--material-theme-sys-light-secondary-container",
          marginBottom: "1px",
        }}>
        Schedule
      </Typography>

      {error && (
        <Typography style={{ color: "var(--material-theme-sys-light-error)" }}>
          {error}
        </Typography>
      )}
      <br></br>

      <Stack direction={"row"} width={800} justifyContent={"flex-end"}>
        <Button
          color={isExecuting ? "error" : "success"}
          onClick={executeSchedule}
          variant="contained">
          {isExecuting ? "Stop" : "Execute"}
        </Button>
      </Stack>
      <TableContainer
        component={Paper}
        sx={{
          maxWidth: 800,
          background: "var(--material-theme-sys-dark-primary-fixed)",
        }}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  color: "var(--material-theme-black)",
                  borderTop: 2,
                  borderLeft: 2,
                  borderRight: 2,
                }}
                align="left">
                Command
              </TableCell>
              <TableCell
                sx={{
                  color: "var(--material-theme-black)",
                  borderTop: 2,
                  borderRight: 2,
                }}
                align="left">
                Status
              </TableCell>
              <TableCell
                sx={{
                  color: "var(--material-theme-black)",
                  borderTop: 2,
                  borderRight: 2,
                }}
                align="left">
                Operator
              </TableCell>
              <TableCell
                sx={{
                  color: "var(--material-theme-black)",
                  borderTop: 2,
                  borderRight: 2,
                }}
                align="left">
                Created
              </TableCell>
              <TableCell
                sx={{
                  color: "var(--material-theme-black)",
                  borderTop: 2,
                  borderRight: 2,
                }}
                align="left">
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
                    borderBottom: 2,
                    borderTop: 2,
                    borderLeft: 2,
                    borderRight: 2,
                    // "&:last-child td, &:last-child th": { border: 1 },
                  }}>
                  <TableCell
                    sx={{ color: "black !important", borderRight: 2 }}
                    align="left"
                    component="th"
                    scope="row">
                    {item.command}
                  </TableCell>
                  <TableCell
                    sx={{ color: "black !important", borderRight: 2 }}
                    align="left">
                    {item.status}
                  </TableCell>
                  <TableCell
                    sx={{ color: "black !important", borderRight: 2 }}
                    align="left">
                    {item.userId.email}
                  </TableCell>
                  <TableCell
                    sx={{ color: "black !important", borderRight: 2 }}
                    align="left">
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
                      sx={{ color: "var(--material-theme-sys-light-error)" }}
                      disabled={item.status === "EXECUTED" || isExecuting}
                      onClick={() => removeCommand(item._id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default ExecuteScheduleCard;
