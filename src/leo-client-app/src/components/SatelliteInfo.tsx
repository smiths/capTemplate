"use client";

import React, { useEffect, useState } from 'react';

interface SatelliteInfoState {
  positionEci: {
    x: number;
    y: number;
    z: number;
  };
  velocityEci: {
    x: number;
    y: number;
    z: number;
  };
}

const SatelliteInfo: React.FC = () => {
  const [state, setState] = useState<SatelliteInfoState>({
    positionEci: {
      x: 0,
      y: 0,
      z: 0,
    },
    velocityEci: {
      x: 0,
      y: 0,
      z: 0,
    },
  });

  const fetchData = () => {
    fetch('http://localhost:3001/getSatelliteInfo') // TODO: Fix endpoint for when server is hosted
      .then((response) => response.json())
      .then((data: SatelliteInfoState) => {
        setState(data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };

  useEffect(() => {
    fetchData(); // Fetch data initially

    // Update data every 1000ms (1s)
    const dataFetchInterval = setInterval(fetchData, 1000);

    return () => {
      // Clear the interval when the component is unmounted to prevent memory leaks
      clearInterval(dataFetchInterval);
    };
  }, []);

  const { positionEci, velocityEci } = state;

  return (
    <div>
      <h2>Satellite Information</h2>
      <div>
        <strong>Position ECI:</strong>
        <ul>
          <li>X: {positionEci.x}</li>
          <li>Y: {positionEci.y}</li>
          <li>Z: {positionEci.z}</li>
        </ul>
      </div>
      <div>
        <strong>Velocity ECI:</strong>
        <ul>
          <li>X: {velocityEci.x}</li>
          <li>Y: {velocityEci.y}</li>
          <li>Z: {velocityEci.z}</li>
        </ul>
      </div>
    </div>
  );
};

export default SatelliteInfo;
