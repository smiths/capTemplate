"use client";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import Navbar from "@/components/navbar/Navbar";
import EditScheduler from "@/components/EditSchedules";
import { Box, Stack } from "@mui/material";
import { useRouter } from "next/router";
import ExecuteScheduleCard from "@/components/ExecuteScheduleCard";
import SchedulerTerminal from "@/components/SchedulerTerminal";
import { ReactTerminal } from "react-terminal";
import { sendCommandToTestForwarder } from "@/constants/api";
import { useState } from "react";
import SocketConnection from "@/components/SocketConnection";
import { useGetPingSocket } from "@/constants/hooks";

function TestPlayground() {
  const router = useRouter();
  const { satId, scheduleId } = router.query as {
    satId: string;
    scheduleId: string;
  };

  const pingSocket = useGetPingSocket();

  // -------- Constants --------
  const isSocketActive =
    pingSocket.data?.output &&
    pingSocket.data.output !== "WEBSOCKET_NOT_CONNECT";

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const sendCommand = async (command: string) => {
    setIsSubmitting(true);
    try {
      const res = await sendCommandToTestForwarder(command);
      setIsSubmitting(false);
      return res;
    } catch (error) {}
    setIsSubmitting(false);

    return null;
  };
  return (
    <main>
      <Stack
        alignItems="center"
        spacing={1}
        sx={{
          minHeight: "100vh",
          margin: "0 auto",
          width: "100%",
          backgroundColor: "var(--material-theme-black)",
        }}>
        <Navbar />
        <Stack
          sx={{ width: "100%", justifyContent: "center", p: 5 }}
          alignItems="center"
          spacing={4}
          py={10}>
          <SocketConnection isSocketActive={isSocketActive} />

          <Box sx={{ width: "100%", height: 300 }}>
            <ReactTerminal
              showControlBar={false}
              enableInput={!isSubmitting && isSocketActive}
              themes={{
                "my-custom-theme": {
                  themeBGColor: "#272B36",
                  themeToolbarColor: "#DBDBDB",
                  themeColor: "#FFFEFC",
                  themePromptColor: "#a917a8",
                },
              }}
              theme="my-custom-theme"
              defaultHandler={async (request: any) => {
                const res = await sendCommand(request);
                return res?.output ?? "Error";
              }}
            />
          </Box>
        </Stack>
      </Stack>
    </main>
  );
}

export default withPageAuthRequired(TestPlayground);
