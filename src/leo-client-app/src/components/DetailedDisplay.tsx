"use client";
import * as d3 from "d3";
import React, { useEffect, useState } from "react";

const DetailedDisplay: React.FC = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    d3.select("#plot").select("svg").remove();

    const formattedStartDate = "2024-01-06T10:15:00"; // Replace with actual start date
    const formattedEndDate = "2024-01-06T10:22:00"; // Replace with actual end date

    fetch(
      `http://localhost:3001/satellite/getPolarPlotData?START_DATE=${formattedStartDate}&END_DATE=${formattedEndDate}`
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
          .attr("r", (d) => (radius / numCircles) * d)
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
          .attr("transform", (d) => `rotate(${(d * 360) / numLines})`)
          .style("stroke", "white");

        // Add radial axis labels
        d3.range(1, numCircles + 1).forEach((d) => {
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
        d3.range(0, 360, 30).forEach((angle) => {
          svg
            .append("text")
            .attr("x", (radius + 30) * Math.cos(toRadians(angle)))
            .attr("y", (radius + 30) * Math.sin(toRadians(angle)))
            .text(angle + "°")
            .style("text-anchor", "middle")
            .style("fill", "white")
            .attr("alignment-baseline", "middle");
        });

        // Draw data points
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
          .style("fill", "red");
      })
      .catch((error) => {
        console.error("Error fetching polar plot data:", error);
      });
  }, []);

  return <div id="plot"></div>;
};

export default DetailedDisplay;
