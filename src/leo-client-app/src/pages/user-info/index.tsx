"use client";

import Image from "next/image";
// import styles from "./page.module.css";
import SatelliteInfo from "@/components/SatelliteInfo";
import FuturePasses from "@/components/FuturePasses";
import { useUser } from "@auth0/nextjs-auth0/client";
import axios from "axios";

export default function Home() {
  const { user } = useUser();

  const getToken = () => {
    var options = {
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/oauth/token`,
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID ?? "",
        client_secret: process.env.NEXT_PUBLIC_AUTH0_CLIENT_SECRET ?? "",
        audience: "https://dev-vj8cjoawrmvnw3jt.us.auth0.com/api/v2/",
      }),
    };

    axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  return (
    <main>
      <a href="/api/auth/login">{user?.email}</a>
      <button onClick={getToken}>get token</button>
    </main>
  );
}
