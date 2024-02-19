import { Link, Stack } from "@mui/material";
import NextLink from "next/link";
import "../styles/navbar.css";

const navbarItems = [
  {
    heading: "Satellites",
    path: "/satellite-passes",
  },
  {
    heading: "Scheduler",
    path: "/schedule-commands",
  },
  {
    heading: "Manage Operators",
    path: "/manage-operators",
  },
  {
    heading: "Logs",
    path: "/satellite-logs",
  },
  {
    heading: "Account",
    path: "/api/auth/logout",
  },
];

const Navbar: React.FC = () => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      spacing={23}
      sx={{ background: "var(--material-theme-sys-dark-background)", py: 2, px:20 }}>
      {navbarItems.map((item, index) => (
        <Link
          key={item.path + index}
          component={NextLink}
          href={item.path}
          underline="none"
          sx={{ color: "var(--material-theme-white)"}}>
          {item.heading}
        </Link>
      ))}
    </Stack>
  );
};

export default Navbar;
