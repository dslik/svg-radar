// -------------------------------------------------------------------------------------
// Copyright 2017, 2018 David Slik, All rights reserved
//
// Released under the Clear BSD license
//
// INPUTS
//   svg - SVG node
//   vars - Array of axis names
//   series - Array of array of series values
//   linecolors - Array of colors, one for each series
//   fillcolors - Array of colors, one for each series
//
// Radar charts can be scaled and translated using SVG groups. For example, to translate a graph, use:
// 
//   group = getNode('g', {transform:"translate(102 0)" });
//   rawGauge(group, 0, 60, 52.3, "V", "Battery 1", 50, null, 48, null);
//   svg.appendChild(group);
//
// To scale a radar chart, use:
// 
//   group = getNode('g', {transform:"scale(2)" });
//   rawGauge(group, 0, 60, 52.3, "V", "Battery 1", 50, null, 48, null);
//   svg.appendChild(group);
//
// ----------------------------------------------------------------------------------------
"use strict";

// Convenience function that creates an SVG element from type, value and text strings
function svgen(n, v, t) {
    n = document.createElementNS("http://www.w3.org/2000/svg", n);
    for (var p in v)
        if(p == "xlink:href") { n.setAttributeNS("http://www.w3.org/1999/xlink", p, v[p]); }
        else if(p == "xmlns:xlink") { n.setAttributeNS("http://www.w3.org/2000/xmlns/", p, v[p]); }
        else if(p == "xmlns") { n.setAttributeNS("http://www.w3.org/2000/xmlns/", p, v[p]); }
        else if(p == "xml:space") { n.setAttributeNS("http://www.w3.org/XML/1998/namespace", p, v[p]); }
        else { n.setAttributeNS(null, p, v[p]); }
    if(t) n.innerHTML = t;
    return n
}

function compareNums(a, b) {
  return a - b;
}

function createRadarChart(svg, vars, series, lineColors, fillColors, fillOpacity) {
	// Constants - Should refactor these later
	const textPointSize = 18;

    // Calculate the bounding box for the radar chart
    const width = svg.getAttribute("width");
    const height = svg.getAttribute("height");
    const size = Math.min(width, height);

    // Calculate the outermost circle
    const labelPadding = 40;
    const radius = size / 2 - labelPadding;
    const centreX = (width - size) / 2 + size / 2;
    const centreY = (height - size) / 2 + size / 2;

    // Calculate the angle between each axis
    const numAxis = vars.length;
    const seriesAngle = 360.0 / numAxis;

    // Calculate the minimum and maximum values to display
    const maxValue = (series.flat(2).sort(compareNums).reverse())[0];
    const minValue = (series.flat(2).sort(compareNums))[0];

    // Handle negative values
    var offset = 0;

    if(minValue < 0)
    {
    	offset = minValue * -1;
    }

    // Calculate the number of series
    const numSeries = series.length

    // Background
    svg.appendChild(svgen("rect", { x: 0,
                                    y: 0,
                                    width: width,
                                    height: height,
                                    stroke: "#000000",
                                    fill: "#FFFFFF" }));

    svg.appendChild(svgen("rect", { x: (width - size) / 2,
                                    y: (height - size) / 2,
                                    width: size,
                                    height: size,
                                    stroke: '#000000',
                                    fill: '#FFFFFF' }));

    // Draw the series regions
    let seriesCounter = 0;
    var seriesRegion;

    while(seriesCounter != numSeries)
    {
        axisCounter = 0;
        axisAngle = 0;
        seriesRegion = String("");

        while(axisCounter != numAxis)
        {
            axisAngle = seriesAngle * axisCounter;

            seriesRegion = seriesRegion + (centreX + (radius * ((series[seriesCounter][axisCounter] + offset) / (maxValue + offset))) * Math.sin(axisAngle * Math.PI/180)) + ",";
            seriesRegion = seriesRegion + (centreY - (radius * ((series[seriesCounter][axisCounter] + offset) / (maxValue + offset))) * Math.cos(axisAngle * Math.PI/180)) + " ";

            axisCounter = axisCounter + 1;
        }

        svg.appendChild(svgen('polygon', { points: seriesRegion,
            	                           fill: fillColors[seriesCounter],
            	                           "fill-opacity": fillOpacity[seriesCounter],
            	                           stroke: "#666666" }));

        seriesCounter = seriesCounter + 1;
    }

    // Draw each axis and label
    var axisCounter = 0;
    var axisAngle = 0;
    var textAlignment = "";

    while(axisCounter != numAxis)
    {
        axisAngle = seriesAngle * axisCounter;

        // Draw each axis line
        svg.appendChild(svgen("line", { x1: centreX,
                                        y1: centreY,
                                        x2: centreX + radius * Math.sin(axisAngle * Math.PI/180),
                                        y2: centreY - radius * Math.cos(axisAngle * Math.PI/180),
                                        stroke: "#666666",
                                        fill: "#FFFFFF" }));

        if(axisAngle == 0 || axisAngle == 180)
        {
        	textAlignment = "middle"
        }
        else
        {
        	if(axisAngle > 180)
        	{
        	    textAlignment = "end"
        	}
        	else
        	{
        	    textAlignment = "start"
        	}
        }

        svg.appendChild(svgen('text', { x: centreX + (radius + 5) * Math.sin(axisAngle * Math.PI/180), 
                                        y: centreY - (radius + textPointSize) * Math.cos(axisAngle * Math.PI/180) + 0.25 * textPointSize,
                                        "text-anchor": textAlignment,
                                        "font-size": textPointSize },
                                        vars[axisCounter]));


        axisCounter = axisCounter + 1;
    }


    // Draw the outermost circle
    svg.appendChild(svgen("circle", { cx: centreX,
                                      cy: centreY,
                                      r: radius,
                                      stroke: "#666666",
                                      fill: "none" }));

    // Draw zero if negative values
    if(offset != 0)
    {
        svg.appendChild(svgen("circle", { cx: centreX,
                                          cy: centreY,
                                          r: radius * (offset / (maxValue + offset)),
                                          stroke: "#666666",
                                          fill: "none" }));
    }

}



