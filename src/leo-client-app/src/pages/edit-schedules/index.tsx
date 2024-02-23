"use client";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import Navbar from "@/components/navbar/Navbar";
import EditScheduler from "@/components/EditSchedules";


type Props = {
  noradId: string;
};

function EditSchedulePage({ noradId }: Props) {
  return (
    <main>
      <Navbar />
      <EditScheduler noradId="55098"/>
    </main>
  );
}

export default withPageAuthRequired(EditSchedulePage);