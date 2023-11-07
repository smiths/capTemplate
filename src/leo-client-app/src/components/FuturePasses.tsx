import { useUser } from "@auth0/nextjs-auth0/client";
import React, { useEffect, useState } from "react";

interface Pass {
  type: string;
  time: string;
  azimuth: number;
  elevation: number;
}

const FuturePasses: React.FC = () => {
  const [passes, setPasses] = useState<Pass[][]>([]);
  const { user } = useUser();

  const fetchPasses = () => {
    fetch("http://localhost:3001/getNextPasses")
      .then((response) => {
        if (!response.ok) {
          throw Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setPasses(data.nextPasses);
      })
      .catch((error) => {
        console.error("Error fetching passes:", error);
      });
  };

  useEffect(() => {
    fetchPasses(); // Fetch passes initially

    // Update passes every 1000ms (1s)
    // TODO: Change to a week for refreshes
    const passesFetchInterval = setInterval(fetchPasses, 1000);

    return () => {
      clearInterval(passesFetchInterval); // Clear the interval when unmounting
    };
  }, []);

  return (
    <div>
      <h1>Next Week's Passes</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th
              style={{
                width: "50%",
                border: "1px solid #000",
                padding: "8px",
              }}>
              Entry
            </th>
            <th
              style={{
                width: "50%",
                border: "1px solid #000",
                padding: "8px",
              }}>
              Exit
            </th>
          </tr>
        </thead>
        <tbody>
          {passes.map((passPair, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #000", padding: "8px" }}>
                {passPair[0].type === "Enter" && <>{passPair[0].time}</>}
              </td>
              <td style={{ border: "1px solid #000", padding: "8px" }}>
                {passPair[1].type === "Exit" && <>{passPair[1].time}</>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FuturePasses;
