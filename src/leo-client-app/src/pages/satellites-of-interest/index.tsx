"use client";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import Navbar from "@/components/navbar/Navbar";
import SatellitesOfInterest from "@/components/SatellitesOfInterest";
import { Stack } from "@mui/material";
import { useUser } from "@auth0/nextjs-auth0/client";
import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "@/constants/api";

function SatellitesOfInterestPage() {
  const { user, error, isLoading } = useUser();
  const [userId, setUserId] = useState("");

  const fetchUser = async (email: string) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/users/getUserByEmail`, {
        params: { email: email },
      });
      setUserId(res.data.user._id);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchUser(user.email);
    }
  }, []);

  return (
    <main>
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={1}
        sx={{ width: "100%", backgroundColor: "var(--material-theme-black)" }}
      >
        <Navbar />
        <SatellitesOfInterest userId={userId} />
      </Stack>
    </main>
  );
}

export default withPageAuthRequired(SatellitesOfInterestPage);
