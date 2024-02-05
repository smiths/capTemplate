import { useRouter } from "next/router";
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SchedulesPage from "@/components/Scheduler";
import EditSchedulePage from "@/components/EditSchedules";
import { useNavigate } from 'react-router-dom';


export default function Index() {
  const { pathname, replace } = useRouter();
    {/* this router component will connect the edit schedules page with the all schedules page
      -- had to be declared in the global index.tsx page for it work; testing it out; didnt work
  */}
  // <Router>
  //   <Routes>
  //     <Route path="/" element={<SchedulesPage />} />
  //     <Route path="/edit-schedule" element={<EditSchedulePage />} />
  //   </Routes>
  // </Router>
  // let navigate = useNavigate();

  // const handleEditClick = () => {
  //   navigate('/edit-schedules/index.tsx');
  // };
  // <button className="edit-button" onClick={handleEditClick}>ABCD</button>

  

  useEffect(() => {
    replace("/satellite-passes");
  }, [pathname, replace]);
  return null;
}
