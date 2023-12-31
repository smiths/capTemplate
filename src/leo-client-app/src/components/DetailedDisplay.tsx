"use client";
import * as d3 from "d3";
import React, { useEffect, useState } from "react";

const DetailedDisplay: React.FC = () => {
  useEffect(() => {
    d3.select("#plot").select("svg").remove();
    const dummyData = [
      { azimuth: 45, elevation: 30 },
      { azimuth: 90, elevation: 60 },
      { azimuth: 135, elevation: 45 },
      // ... more data points
    ];

    const width = 400;
    const height = 400;
    const margin = 50;

    // Create SVG element
    const svg = d3
      .select("#plot")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // Create scale for radius (elevation)
    const radiusScale = d3
      .scaleLinear()
      .domain([0, 70])
      .range([0, (width - margin) / 2]);

    // Create scale for azimuth (angle)
    const angle = (d) => (d.azimuth - 90) * (Math.PI / 180);

    const numCircles = 4; // Number of circles to draw
    svg
      .selectAll(".radial-axis")
      .data(
        d3
          .range(numCircles)
          .map((d) => (d + 1) * (radiusScale.range()[1] / numCircles))
      )
      .enter()
      .append("circle")
      .attr("class", "radial-axis")
      .attr("r", (d) => d)
      .style("fill", "none")
      .style("stroke", "white");

    const numLines = 12; // Number of lines to draw
    svg
      .selectAll(".angular-axis")
      .data(d3.range(numLines))
      .enter()
      .append("line")
      .attr("class", "angular-axis")
      .attr("y2", -radiusScale.range()[1])
      .attr("transform", (d) => `rotate(${(d * 360) / numLines})`)
      .style("stroke", "white");

    // Draw data points
    svg
      .selectAll(".data-point")
      .data(dummyData)
      .enter()
      .append("circle")
      .attr("class", "data-point")
      .attr("cx", (d) => radiusScale(d.elevation) * Math.cos(angle(d)))
      .attr("cy", (d) => radiusScale(d.elevation) * Math.sin(angle(d)))
      .attr("r", 5)
      .style("fill", "red");
  }, []);

  return <div id="plot"></div>;
};

export default DetailedDisplay;
