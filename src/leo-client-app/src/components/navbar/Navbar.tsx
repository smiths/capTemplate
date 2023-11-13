import { Link, Stack } from "@mui/material";
import NextLink from "next/link";

const navbarItems = [
  {
    heading: "Satellite passes",
    path: "/satellite-passes",
  },
  {
    heading: "Manage Operators",
    path: "/manage-operators",
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
      alignItems="center"
      justifyContent="flex-end"
      spacing={5}
      sx={{ background: "#40403fb0", py: 2, px: 4 }}>
      {navbarItems.map((item, index) => (
        <Link
          key={item.path + index}
          component={NextLink}
          href={item.path}
          underline="none"
          sx={{ color: "#6cb6ff" }}>
          {item.heading}
        </Link>
      ))}
    </Stack>
  );
};

export default Navbar;
