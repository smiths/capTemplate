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
    heading: "Log Out",
    path: "/api/auth/logout",
  },
];

const Navbar: React.FC = () => {
  return (
    <Stack
      direction="row"
      alignItems="left"
      justifyContent="space-between"
      spacing={5}
      className="navBar"
      style={{ width: "100%", margin: 0, padding: 0 }}
    >
      {navbarItems.map((item, index) => (
        <Link
          key={item.path + index}
          component={NextLink}
          href={item.path}
          underline="none"
          sx={{ color: "var(--material-theme-sys-light-inverse-on-surface)" }}
        >
          {item.heading}
        </Link>
      ))}
    </Stack>
  );
};

export default Navbar;
