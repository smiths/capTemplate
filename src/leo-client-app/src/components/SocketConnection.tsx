import { Stack, Typography } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";

type Props = {
  isSocketActive: boolean;
};

const SocketConnection = ({ isSocketActive }: Props) => {
  return (
    <Stack direction="row" sx={{ width: "100%" }} spacing={1} alignItems="left">
      <CircleIcon
        sx={{ width: 12 }}
        color={isSocketActive ? "success" : "error"}
      />
      <Typography>
        Ground Station - {isSocketActive ? "ACTIVE" : "NOT ACTIVE"}
      </Typography>
    </Stack>
  );
};

export default SocketConnection;
