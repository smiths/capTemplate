"use client";

import { useUser, withPageAuthRequired } from "@auth0/nextjs-auth0/client";

function UserInfoPage() {
  const { user } = useUser();

  return (
    <main>
      <a href="/api/auth/login">{user?.email}</a>
    </main>
  );
}

export default withPageAuthRequired(UserInfoPage);
