// -------------------------------------------------------------------------------------
// Copyright 2017, 2018 David Slik, All rights reserved
//
// Released under the Clear BSD license
//
// ----------------------------------------------------------------------------------------
"use strict";

class radarSeries {
    constructor(name, yValues, colour = "#000000", opacity = 1.0) {
        this.name = name;
        this.values = yValues;
        this.colour = colour;
        this.opacity = opacity;
    }
}

class radarCategories {
    constructor(xValues, style = "basic") {
        this.textPointSize = 18;
        this.labelPadding = 40;

        this.labels = xValues;
        this.style = style;
    }
}

class radarChart {
    constructor(svg, categories) {
        this.svg = svg;

        this.series = new Array();
        this.categories = categories;

        this.numLabels = categories.labels.length;

    }

    addSeries(series) {
        if(series.values.length == this.numLabels)
        {
            this.series.push(series);
            return(series);
        }
    }

    render()
    {
        this.width = svg.getAttribute("width");
        this.height = svg.getAttribute("height");
        this.size = Math.min(this.width, this.height);

        // Calculate the outermost circle
        this.radius = this.size / 2 - this.categories.labelPadding;
        this.centreX = (this.width - this.size) / 2 + this.size / 2;
        this.centreY = (this.height - this.size) / 2 + this.size / 2;

        // Calculate the angle between each axis
        this.seriesAngle = 360.0 / this.numLabels;

        // Calculate the minimum and maximum values to display
        var values = new Array();
        var seriesCounter = 0;

        while(seriesCounter < this.series.length)
        {
            values = values.concat(this.series[seriesCounter].values);
            seriesCounter = seriesCounter + 1;
        }

        this.maxValue = values.sort(compareNums).reverse()[0];
        this.minValue = values.sort(compareNums)[0];

        // Increase maxValue by 10% to allow space for values
        this.maxValue = this.maxValue * 1.1;

        this.#drawOutline();
        this.#drawSeries();
        this.#drawCategories();
    }

    #drawOutline() {
        this.svg.appendChild(svgen("rect", { x: 0,
                                             y: 0,
                                             width: this.width,
                                             height: this.height,
                                             stroke: "#000000",
                                             fill: "#FFFFFF" }));

        this.svg.appendChild(svgen("rect", { x: (this.width - this.size) / 2,
                                             y: (this.height - this.size) / 2,
                                             width: this.size,
                                             height: this.size,
                                             stroke: '#000000',
                                             fill: '#FFFFFF' }));
    }

    #drawSeries() {
        // Draw the series regions
        let seriesCounter = 0;
        var seriesRegion;

        while(seriesCounter < this.series.length)
        {
            var axisCounter = 0;
            var axisAngle = 0;
            var seriesRegion = String("");

            while(axisCounter < this.numLabels)
            {
                axisAngle = this.seriesAngle * axisCounter;

                seriesRegion = seriesRegion + (this.centreX + (this.radius * (this.series[seriesCounter].values[axisCounter] / this.maxValue)) * Math.sin(axisAngle * Math.PI/180)) + ",";
                seriesRegion = seriesRegion + (this.centreY - (this.radius * (this.series[seriesCounter].values[axisCounter] / this.maxValue)) * Math.cos(axisAngle * Math.PI/180)) + " ";

                axisCounter = axisCounter + 1;
            }

            this.svg.appendChild(svgen('polygon', { points: seriesRegion,
                                               fill: this.series[seriesCounter].colour,
                                               "fill-opacity": this.series[seriesCounter].opacity,
                                               stroke: "#666666" }));

            seriesCounter = seriesCounter + 1;
        }
    }

    #drawCategories() {
         // Draw each axis and label
        var axisCounter = 0;
        var axisAngle = 0;
        var textAlignment = "";

        while(axisCounter != this.numLabels)
        {
            axisAngle = this.seriesAngle * axisCounter;

            // Draw each axis line
            this.svg.appendChild(svgen("line", { x1: this.centreX,
                                            y1: this.centreY,
                                            x2: this.centreX + this.radius * Math.sin(axisAngle * Math.PI/180),
                                            y2: this.centreY - this.radius * Math.cos(axisAngle * Math.PI/180),
                                            stroke: "#666666" }));

            axisCounter = axisCounter + 1;
        }


        // Draw the outermost circle
        this.svg.appendChild(svgen("circle", { cx: this.centreX,
                                          cy: this.centreY,
                                          r: this.radius,
                                          stroke: "#666666",
                                          fill: "none" }));


        axisCounter = 0;

        if(this.categories.style == "basic")
        {
            while(axisCounter != this.numLabels)
            {
                axisAngle = this.seriesAngle * axisCounter;

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

                this.svg.appendChild(svgen('text', { x: this.centreX + (this.radius + 5) * Math.sin(axisAngle * Math.PI/180), 
                                                y: this.centreY - (this.radius + this.categories.textPointSize) * Math.cos(axisAngle * Math.PI/180) + 0.25 * this.categories.textPointSize,
                                                "text-anchor": textAlignment,
                                                "font-size": this.categories.textPointSize },
                                                this.categories.labels[axisCounter]));

                axisCounter = axisCounter + 1;
            }
        }

        if(this.categories.style == "classic")
        {
            var offsetRadius = this.radius + 18;
            var baseline = "";

            this.svg.appendChild(svgen("circle", { cx: this.centreX,
                                                   cy: this.centreY,
                                                   r: this.radius + 10,
                                                   stroke: "#666666",
                                                   fill: "none" }));

            this.svg.appendChild(svgen("circle", { cx: this.centreX,
                                                   cy: this.centreY,
                                                   r: this.radius + 30,
                                                   stroke: "#666666",
                                                   fill: "none" }));

            while(axisCounter != this.numLabels)
            {
                axisAngle = this.seriesAngle * axisCounter;

                var rotatedX = this.centreX + ((this.radius + 10) * Math.sin((axisAngle + (this.seriesAngle / 2)) * Math.PI/180));
                var rotatedY = this.centreY - ((this.radius + 10) * Math.cos((axisAngle + (this.seriesAngle / 2)) * Math.PI/180));
                var rotatedX2 = this.centreX + ((this.radius + 30) * Math.sin((axisAngle + (this.seriesAngle / 2)) * Math.PI/180));
                var rotatedY2 = this.centreY - ((this.radius + 30) * Math.cos((axisAngle + (this.seriesAngle / 2)) * Math.PI/180));


                this.svg.appendChild(svgen("line", { x1: rotatedX,
                                            y1: rotatedY,
                                            x2: rotatedX2,
                                            y2: rotatedY2,
                                            stroke: "#666666" }));

                // Rotate by -1/2 of seriesAngle
                rotatedX = this.centreX + (offsetRadius * Math.sin((axisAngle - (this.seriesAngle / 2)) * Math.PI/180));
                rotatedY = this.centreY - (offsetRadius * Math.cos((axisAngle - (this.seriesAngle / 2)) * Math.PI/180));
                rotatedX2 = this.centreX + (offsetRadius * Math.sin((axisAngle + (this.seriesAngle / 2)) * Math.PI/180));
                rotatedY2 = this.centreY - (offsetRadius * Math.cos((axisAngle + (this.seriesAngle / 2)) * Math.PI/180));

                if(axisAngle >= 90 && axisAngle <=269)
                {

                    this.svg.appendChild(svgen("path", { id: "label" + axisCounter,
                                                     d: "M" + rotatedX2 + "," + rotatedY2 + " A" + offsetRadius + "," + offsetRadius + " 0 0,0 " + rotatedX + "," + rotatedY,
                                                     visiblity: "#hidden",
                                                     fill: "none" }));

                    baseline = "-40%";

                }
                else
                {
                    this.svg.appendChild(svgen("path", { id: "label" + axisCounter,
                                                     d: "M" + rotatedX + "," + rotatedY + " A" + offsetRadius + "," + offsetRadius + " 0 0,1 " + rotatedX2 + "," + rotatedY2,
                                                     visiblity: "#hidden",
                                                     fill: "none" }));

                    baseline = "-20%";
                }

                var text = this.svg.appendChild(svgen("text", {}));

                text.appendChild(svgen("textPath", {"href": "#label" + axisCounter,
                                                    "startOffset": "50%",
                                                    "text-anchor": "middle",
                                                    "baseline-shift": baseline },
                                                    this.categories.labels[axisCounter]));

                axisCounter = axisCounter + 1;
            }
        }
    }
}

// -------------------------------------------------------------------------------------
// Utility Functions
// ----------------------------------------------------------------------------------------

// Creates an SVG element from type, value and text strings
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

// Returns positive if a > b, negative if a < b, and zero if they are equal.
// Used for sort to compare numbers (otherwise it compares strings)
function compareNums(a, b) {
  return a - b;
}



