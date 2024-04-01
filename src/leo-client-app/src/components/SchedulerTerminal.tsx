import { sendCommandToForwarder } from "@/constants/api";
import { useGetValidCommands } from "@/constants/hooks";
import { Box, Stack, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { ReactTerminal } from "react-terminal";

type Props = {
  disabled?: boolean;
};

const SchedulerTerminal = ({ disabled = false }: Props) => {
  const router = useRouter();

  const queryClient = useQueryClient();

  const scheduleId = router.query?.scheduleId?.toString() ?? "";
  const satelliteId = router.query?.satId?.toString() ?? "";
  const userId = "65a8181f36ea10b4366e1dd9";
  const validCommands = useGetValidCommands(satelliteId, userId);

  const delay = (ms: any) => new Promise((res) => setTimeout(res, ms));

  const sendCommand = async (command: string) => {
    try {
      const res = await sendCommandToForwarder(
        userId,
        scheduleId,
        satelliteId,
        // TODO: change
        command
      );
      return res;
    } catch (error) {}
    await queryClient.invalidateQueries({
      queryKey: ["useGetCommandsBySchedule"],
    });
  };

  const commandSendingHandler = async (...args: string[]) => {
    let commandReq = "";

    // Iterate through each command separated by space
    for (const message of args) {
      commandReq += message + " ";
    }

    // Remove trailing white spaces
    commandReq = commandReq.trim();

    // Check if command is valid
    const isValid = validCommands.data?.record[0]?.validCommands.some(
      (cmd: string) => cmd === commandReq
    );

    if (!isValid) {
      return "Invalid command sequence";
    }

    const res = await sendCommand(commandReq);

    // Refetch commands scheduled
    await queryClient.invalidateQueries({
      queryKey: ["useGetCommandsBySchedule"],
    });

    // Split string by lines
    const messages = res.output?.toString().split("\n") ?? "";

    return (
      <Stack gap={1}>
        {!messages?.length && <Typography>Error</Typography>}
        {messages?.length &&
          messages.map((msg: string, index: number) => (
            <p key={"terminal-message " + index}>{msg}</p>
          ))}
      </Stack>
    );
  };

  const commands = {
    help: (
      <Stack flexWrap={"wrap"} direction={"row"} spacing={4}>
        {validCommands.data?.record?.length &&
          validCommands.data?.record[0]?.validCommands.map(
            (cmd: string, index: number) => (
              <Typography key={cmd + index}>{cmd}</Typography>
            )
          )}
      </Stack>
    ),
  };

  return (
    <Stack
      sx={{ width: "100%", maxWidth: 1000 }}
      alignItems="center"
      spacing={4}
      py={10}>
      <Box sx={{ width: "100%", height: 300 }}>
        <ReactTerminal
          commands={commands}
          showControlBar={false}
          enableInput={!disabled}
          themes={{
            "my-custom-theme": {
              themeBGColor: "#272B36",
              themeToolbarColor: "#DBDBDB",
              themeColor: "#FFFEFC",
              themePromptColor: "#a917a8",
            },
          }}
          theme="my-custom-theme"
          defaultHandler={commandSendingHandler}
        />
      </Box>
    </Stack>
  );
};

export default SchedulerTerminal;
