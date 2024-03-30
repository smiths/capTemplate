import { Link, Stack } from "@mui/material";
import NextLink from "next/link";
import "../styles/navbar.css";
import { useRouter } from "next/router";

const Navbar: React.FC = () => {
  const router = useRouter();
  let { satId } = router.query as {
    satId: string;
  };

  if (!satId) {
    satId = "655acd63d122507055d3d2ea";
  }

  const navbarItems = [
    {
      heading: "Satellites",
      path: "/satellites-of-interest",
    },
    {
      heading: "Scheduler",
      path: `/schedule-commands/${satId}`,
    },
    {
      heading: "Manage Operators",
      path: "/manage-operators",
    },
    {
      heading: "Commands",
      path: `/satellite-commands/${satId}`,
    },
    {
      heading: "Logs",
      path: `/satellite-logs/${satId}`,
    },
    {
      // heading: "Account",
      heading: "Log Out",
      path: "/api/auth/logout",
    },
  ];

  return (
    <Stack
      direction="row"
      alignItems="left"
      justifyContent="space-between"
      spacing={5}
      className="navBar"
      style={{ width: "100%", margin: 0, padding: 0, marginTop: "100px"}}
    >
      {navbarItems.map((item, index) => (
        <Link
          key={item.path + index}
          component={NextLink}
          href={item.path}
          underline="none"
          sx={{color: "var(--material-theme-white)"}}
        >
          {item.heading}
        </Link>
      ))}
    </Stack>
  );
};

export default Navbar;
