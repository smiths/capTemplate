import { useGetAllOperators } from "@/constants/hooks";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const OperatorList: React.FC = () => {
  const operators = useGetAllOperators();

  console.log(operators.data);

  return (
    <TableContainer component={Paper} sx={{ maxWidth: 800 }}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center">Email</TableCell>
            <TableCell align="center">Role</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {operators?.data &&
            operators.data.operators.map((user: any, index: number) => (
              <TableRow
                key={user._id + index}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell align="center" component="th" scope="row">
                  {user.email}
                </TableCell>
                <TableCell align="center">{user.role}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OperatorList;
