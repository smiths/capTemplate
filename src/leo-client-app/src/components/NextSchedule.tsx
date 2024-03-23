import {
  useGetCommandsBySchedule,
  useGetSchedulesBySatellite,
} from "@/constants/hooks";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
} from "@mui/material";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
}

function formatTimeRange(startTime: string, endTime: string) {
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  const startHours = startDate.getHours();
  const startMinutes = startDate.getMinutes().toString().padStart(2, "0");
  const endHours = endDate.getHours();
  const endMinutes = endDate.getMinutes().toString().padStart(2, "0");

  const formattedStartTime = startHours + ":" + startMinutes;
  const formattedEndTime = endHours + ":" + endMinutes;

  return `${formattedStartTime} - ${formattedEndTime}`;
}

const NextSchedule = () => {
  const router = useRouter();

  const satelliteId = router.query?.satId?.toString() ?? "";

  const [firstSchedule, setFirstSchedule] = useState<any>(null);

  // fetch schedule
  const schedules = useGetSchedulesBySatellite(satelliteId);
  const commands = useGetCommandsBySchedule(firstSchedule?._id ?? "", 5);

  useEffect(() => {
    if (schedules.data?.schedules.length) {
      setFirstSchedule(schedules.data.schedules[0]);
    }
  }, [schedules.data]);

  console.log(schedules.data?.schedules[0]);

  return (
    <div className="upcomingSchedules">
      <Stack alignItems="flex-start" spacing={1}>
        <p className="headerBox">Next Schedule</p>

        {!firstSchedule ? (
          <Box className="loadingBox">
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ width: "100%" }}>
            <NextLink
              href={`/execute-schedule/${satelliteId}/${
                firstSchedule?._id ?? ""
              }`}
              passHref
            >
              <Card
                sx={{
                  //   minWidth: 150,
                  //   maxWidth: 150,
                  margin: 0.5,
                  backgroundColor:
                    "var(--material-theme-sys-light-inverse-on-surface)",
                  cursor: "pointer",
                  borderRadius: 3,
                  minHeight: 50,
                  maxHeight: 150,
                  display: "flex",
                  flexDirection: "column",
                  //   width: "100%",
                }}
              >
                <CardContent>
                  <Stack spacing={0}>
                    <p className="cardTitle">
                      {formatDate(firstSchedule.startDate)}
                    </p>

                    <p className="cardSubtitle">
                      {formatTimeRange(
                        firstSchedule.startDate,
                        firstSchedule.endDate
                      )}
                    </p>
                  </Stack>
                </CardContent>
              </Card>
            </NextLink>
          </Box>
        )}
      </Stack>
    </div>
  );
};

export default NextSchedule;
