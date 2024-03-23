import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import React from "react";
import "../styles.css";
import { useGetLogByCommand } from "@/constants/hooks";

type Props = {
  open: boolean;
  commandId: string;
  handleClose: () => void;
};

export default function LogByCommandModal({
  open,
  commandId,
  handleClose,
}: Props) {
  const logData = useGetLogByCommand(commandId);
  console.log(logData.data);
  const downloadLogs = () => {
    const file = new Blob([JSON.stringify(logData?.data?.log?.response)], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.download = "logFile.txt";
    link.href = url;
    link.click();
    handleClose();
  };

  console.log(logData?.data?.log && logData?.data?.log?.response);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">
      <DialogTitle
        id="alert-dialog-title"
        sx={{
          background: "var(--material-theme-sys-light-primary-fixed)",
        }}>
        {"Satellite Logs dialog"}
      </DialogTitle>
      <DialogContent
        sx={{ background: "var(--material-theme-sys-light-primary-fixed)" }}>
        <DialogContentText id="alert-dialog-description">
          <Typography variant={"body2"}>
            <pre>
              {logData?.data?.log?.response &&
                JSON.stringify(logData.data.log.response, undefined, 2)}
            </pre>{" "}
          </Typography>{" "}
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{ background: "var(--material-theme-sys-light-primary-fixed)" }}>
        <Button
          sx={{
            color: "var(--material-theme-sys-dark-on-primary)",
            backgroundColor: "var(--material-theme-sys-dark-primary)",
            borderRadius: "10px",
          }}
          onClick={downloadLogs}>
          Download Logs
        </Button>
        <Button
          sx={{
            color: "var(--material-theme-sys-dark-on-primary)",
            backgroundColor: "var(--material-theme-sys-dark-primary)",
            borderRadius: "10px",
          }}
          onClick={handleClose}
          autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
