import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


type Props = {
    open: boolean;
    logData: any;
    handleClose: () => void;
  };

export default function LogDialog({ open, logData, handleClose }: Props) {
//   const [open, setOpen] = React.useState(false);

const downloadLogs = () => {
  const file = new Blob([JSON.stringify(logData?.data?.message)], {type: 'text/plain'});
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.download = "logFile.txt";
  link.href = url;
  link.click();
  handleClose();
}

//   const handleClickOpen = () => {
//     setOpen(true);
//   };

//   const handleClose = () => {
//     setOpen(false);
//   };

  return (
    <React.Fragment>
      {/* <Button variant="outlined" onClick={handleClickOpen}>
        Open alert dialog
      </Button> */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Satellite Logs dialog"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {JSON.stringify(logData?.data?.message)}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={downloadLogs}>Download Logs</Button>
          <Button onClick={handleClose} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}