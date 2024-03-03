import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import React from "react";

type Props = {
  open: boolean;
  logData: any;
  handleClose: () => void;
};

export default function LogDialog({ open, logData, handleClose }: Props) {
  const downloadLogs = () => {
    const file = new Blob([JSON.stringify(logData?.data?.message)], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.download = "logFile.txt";
    link.href = url;
    link.click();
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle
        id="alert-dialog-title"
        sx={{
          background: "var(--material-theme-sys-light-primary-fixed)",
        }}
      >
        {"Satellite Logs dialog"}
      </DialogTitle>
      <DialogContent
        sx={{ background: "var(--material-theme-sys-light-primary-fixed)" }}
      >
        <DialogContentText id="alert-dialog-description">
          {logData?.data?.message}
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{ background: "var(--material-theme-sys-light-primary-fixed)" }}
      >
        <Button
          sx={{
            color: "var(--material-theme-sys-dark-on-primary)",
            backgroundColor: "var(--material-theme-sys-dark-primary)",
            borderRadius: "10px",
          }}
          onClick={downloadLogs}
        >
          Download Logs
        </Button>
        <Button
          sx={{
            color: "var(--material-theme-sys-dark-on-primary)",
            backgroundColor: "var(--material-theme-sys-dark-primary)",
            borderRadius: "10px",
          }}
          onClick={handleClose}
          autoFocus
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
