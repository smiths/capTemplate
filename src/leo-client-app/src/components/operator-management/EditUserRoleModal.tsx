import { updateOperatorRole } from "@/constants/api";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  userData: any;
  handleClose: () => void;
};

enum UserRole {
  "OPERATOR" = "OPERATOR",
  "ADMIN" = "ADMIN",
}

const EditUserRoleModal = ({ open, userData, handleClose }: Props) => {
  const queryClient = useQueryClient();

  const [userRole, setUserRole] = useState<UserRole>(UserRole.OPERATOR);

  useEffect(() => {
    if (userData) setUserRole(userData?.role);
  }, [userData]);

  const handleEditRoleChange = (event: any) => {
    setUserRole(event.target.value);
  };

  const { mutate } = useMutation({
    mutationFn: () =>
      updateOperatorRole(userData?._id ?? "", { role: userRole }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["useGetAllOperators"] });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["useGetAllOperators"] });
      handleClose();
    },
  });

  if (!userData) {
    return <></>;
  }

  return (
    <Dialog fullWidth open={open}>
      <DialogTitle>Edit user role</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <DialogContentText sx={{ wordBreak: "break-word" }}>
            {`Editing role for ${userData.email}`}
          </DialogContentText>
          <Select
            fullWidth
            labelId="edit-user-select-label"
            id="edit-user-select"
            value={userRole}
            label="User role"
            onChange={handleEditRoleChange}>
            {userData &&
              Object.values(UserRole).map((role, index) => {
                return (
                  <MenuItem
                    key={"edit-operator-role-menu-item" + index}
                    value={role}>
                    {role}
                  </MenuItem>
                );
              })}
          </Select>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" type="button" onClick={handleClose}>
          {"Close"}
        </Button>
        <Button
          onClick={() => {
            mutate();
          }}
          variant="contained"
          color="error"
          type="button">
          {"Save changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserRoleModal;
