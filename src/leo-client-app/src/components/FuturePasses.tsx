import React, { useEffect, useState } from 'react';

interface Pass {
  time: string;
  azimuth: number;
  elevation: number;
}

const FuturePasses: React.FC = () => {
  const [passes, setPasses] = useState<Pass[]>([]);

  const fetchPasses = () => {
    fetch('http://localhost:3001/getNextPasses')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setPasses(data.nextPasses);
      })
      .catch((error) => {
        console.error('Error fetching passes:', error);
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
      <ul>
        {passes.map((pass, index) => (
          <li key={index}>
            <strong>Time:</strong> {pass.time} - <strong>Azimuth:</strong> {pass.azimuth} - <strong>Elevation:</strong> {pass.elevation}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FuturePasses;
