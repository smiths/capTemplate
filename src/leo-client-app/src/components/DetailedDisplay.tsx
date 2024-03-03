"use client";
import * as d3 from "d3";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { BACKEND_URL } from "@/constants/api";

interface DataPoint {
  elevation: number;
  azimuth: number;
}

interface DetailedDisplayProps {
  startTime?: string;
  endTime?: string;
  noradId: string;
}

function formatTime(time: string): string {
  const dateObj = new Date(time);
  return dateObj
    .toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    .replace(/\u202f/g, " ");
}

const DetailedDisplay: React.FC<DetailedDisplayProps> = ({
  noradId,
  startTime,
  endTime,
}) => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [startAzimuth, setStartAzimuth] = useState<number>();
  const [endAzimuth, setEndAzimuth] = useState<number>();
  const [maxElevation, setmaxElevation] = useState<number>();
  const router = useRouter();

  useEffect(() => {
    d3.select("#plot").select("svg").remove();

    // Get start Azimuth
    fetch(
      `${BACKEND_URL}/satellite/getSatelliteInfo?searchDate=${encodeURIComponent(
        startTime ?? ""
      )}`
    )
      .then((response) => {
        if (!response.ok) {
          throw Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setStartAzimuth(data.azimuth);
      })
      .catch((error) => {
        console.error("Error fetching start azimuth:", error);
      });

    // Get end Azimuth
    fetch(
      `${BACKEND_URL}/satellite/getSatelliteInfo?noradId=${noradId}&searchDate=${encodeURIComponent(
        endTime ?? ""
      )}`
    )
      .then((response) => {
        if (!response.ok) {
          throw Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setEndAzimuth(data.azimuth);
      })
      .catch((error) => {
        console.error("Error fetching end azimuth:", error);
      });

    // Get max elevation
    fetch(
      `${BACKEND_URL}/satellite/getMaxElevation?noradId=${noradId}&START_DATE=${startTime}&END_DATE=${endTime}`
    )
      .then((response) => {
        if (!response.ok) {
          throw Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setmaxElevation(data.maxElevation);
      })
      .catch((error) => {
        console.error("Error fetching end azimuth:", error);
      });

    //Plot the polar plot
    fetch(
      `${BACKEND_URL}/satellite/getPolarPlotData?noradId=${noradId}&START_DATE=${startTime}&END_DATE=${endTime}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setData(data);
        const width = 500;
        const height = 500;
        const margin = 50;
        const radius = Math.min(width, height) / 2 - margin;

        // Scale for the radius
        const rScale = d3.scaleLinear().domain([90, 0]).range([0, radius]);

        // Number of concentric circles for radial axis
        const numCircles = 3;

        // Number of azimuth axis, all on 30 degree interval
        const numLines = 12;

        // Function to convert degrees to shift position in radians
        const toRadians = (angle: number) => ((90 - angle) * Math.PI) / -180;

        // Create SVG element
        const svg = d3
          .select("#plot")
          .append("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        // Draw elevation circles
        svg
          .selectAll("circle")
          .data(d3.range(1, numCircles + 1))
          .enter()
          .append("circle")
          .attr("r", (d: number) => (radius / numCircles) * d)
          .style("fill", "none")
          .style("stroke", "white");

        // Draw azimuth axis
        svg
          .selectAll(".angular-axis")
          .data(d3.range(numLines))
          .enter()
          .append("line")
          .attr("class", "angular-axis")
          .attr("y2", -rScale.range()[1])
          .attr("transform", (d: number) => `rotate(${(d * 360) / numLines})`)
          .style("stroke", "white");

        // Add radial axis labels
        d3.range(1, numCircles + 1).forEach((d: number) => {
          svg
            .append("text")
            .attr("x", 0)
            .attr("y", (-radius / numCircles) * d)
            .text(rScale.invert((radius / numCircles) * d).toFixed(0) + "°")
            .style("text-anchor", "middle")
            .style("fill", "white");
        });

        // Add 90 degree elevation
        svg
          .append("text")
          .attr("x", 0)
          .attr("y", 20)
          .text("90°")
          .style("text-anchor", "middle")
          .style("fill", "white")
          .attr("dy", ".35em"); // Vertically center text

        // Add azimuth axis labels every 30 degrees
        d3.range(0, 360, 30).forEach((angle: number) => {
          svg
            .append("text")
            .attr("x", (radius + 30) * Math.cos(toRadians(angle)))
            .attr("y", (radius + 30) * Math.sin(toRadians(angle)))
            .text(angle + "°")
            .style("text-anchor", "middle")
            .style("fill", "white")
            .attr("alignment-baseline", "middle");
        });

        // Draw all data points in white
        svg
          .selectAll(".data-point")
          .data(data)
          .enter()
          .append("circle")
          .attr("class", "data-point")
          .attr(
            "cx",
            (d: any) => rScale(d.elevation) * Math.cos(toRadians(d.azimuth))
          )
          .attr(
            "cy",
            (d: any) => rScale(d.elevation) * Math.sin(toRadians(d.azimuth))
          )
          .attr("r", 5)
          .style("fill", "white");

        // Draw the first data point in green
        svg
          .selectAll(".entry-point")
          .data([data[0]])
          .enter()
          .append("circle")
          .attr("class", "entry-point")
          .attr(
            "cx",
            (d: any) => rScale(d.elevation) * Math.cos(toRadians(d.azimuth))
          )
          .attr(
            "cy",
            (d: any) => rScale(d.elevation) * Math.sin(toRadians(d.azimuth))
          )
          .attr("r", 5)
          .style("fill", "lime");

        // Draw the last data point in red
        svg
          .selectAll(".exit-point")
          .data([data[data.length - 1]])
          .enter()
          .append("circle")
          .attr("class", "exit-point")
          .attr(
            "cx",
            (d: any) => rScale(d.elevation) * Math.cos(toRadians(d.azimuth))
          )
          .attr(
            "cy",
            (d: any) => rScale(d.elevation) * Math.sin(toRadians(d.azimuth))
          )
          .attr("r", 5)
          .style("fill", "red");
      })
      .catch((error) => {
        console.error("Error fetching polar plot data:", error);
      });
  }, [noradId, startTime, endTime]);

  return (
    <div>
      <div id="plot"></div>
      <p>&#x1F7E2; Entry &#x1F534; Exit</p>
      <br />
      {typeof startAzimuth === "number" && (
        <p>Start Azimuth: {startAzimuth}°</p>
      )}
      {typeof endAzimuth === "number" && <p>End Azimuth: {endAzimuth}°</p>}
      {typeof maxElevation === "number" && (
        <p>Max Elevation: {maxElevation}°</p>
      )}
      {typeof startTime === "string" && <p>AOS: {formatTime(startTime)}</p>}
      {typeof endTime === "string" && <p>LOS: {formatTime(endTime)}</p>}
      <p>
        Max elevation closest to the nearest second. AOS and LOS closest to the
        nearest minute.
      </p>
    </div>
  );
};

export default DetailedDisplay;
