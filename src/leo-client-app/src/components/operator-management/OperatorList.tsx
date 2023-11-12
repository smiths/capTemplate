import { useGetAllOperators } from "@/constants/hooks";
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
import { useState } from "react";
import EditUserRoleModal from "./EditUserRoleModal";

const OperatorList: React.FC = () => {
  const operators = useGetAllOperators();

  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const [userToEdit, setUserToEdit] = useState<any>(null);

  console.log(operators.data);

  const handleModalOpen = (userData: any) => {
    setUserToEdit(userData);
    setOpenEditModal(true);
  };

  const handleModalClose = () => {
    setUserToEdit(null);
    setOpenEditModal(false);
  };

  return (
    <Stack sx={{ width: "100%" }} alignItems="center" spacing={3} py={5}>
      <Typography variant="h5">Users</Typography>
      <TableContainer component={Paper} sx={{ maxWidth: 800 }}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="left">Email</TableCell>
              <TableCell align="left">Role</TableCell>
              <TableCell align="left">Edit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {operators?.data &&
              operators.data.operators.map((user: any, index: number) => (
                <TableRow
                  key={user._id + index}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell align="left" component="th" scope="row">
                    {user.email}
                  </TableCell>
                  <TableCell align="left">{user.role}</TableCell>
                  <TableCell align="left">
                    <Button
                      variant="text"
                      onClick={() => handleModalOpen(user)}>
                      Edit Role
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <EditUserRoleModal
        open={openEditModal}
        userData={userToEdit}
        handleClose={handleModalClose}
      />
    </Stack>
  );
};

export default OperatorList;
