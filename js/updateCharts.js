// Constants for the charts, that would be useful.
const BARCHART_MARGIN = { left: 50, bottom: 50, top: 50, right: 100 };
const BUBBLECHART_MARGIN = { left: 50, bottom: 10, top: 50, right: 100 };
const LINECHART_MARGIN = { left: 30, bottom: 20, top: 150, right: 30 };

// these update based on the window size
let titleFontSize = 20;
let legendFontSize = 15;

// mode 0: all violations
// mode 1: non critical violations
// mode 2: critical violations
function drawLineGraph() {
  let mode = parseInt(document.getElementById("lineGraphTypeSelection").value);

  // how far below the chart the legend begins
  let legendOffset = 45;

  let svg = d3.select("#lineGraph").select("svg");
  let boxWidth = parseInt(
    svg.style("width").substring(0, svg.style("width").length - 2)
  );
  let boxHeight = svg
    .style("height")
    .substring(0, svg.style("height").length - 2);
  let chartWidth = boxWidth - LINECHART_MARGIN.left - LINECHART_MARGIN.right;
  let chartHeight = boxHeight - LINECHART_MARGIN.top - LINECHART_MARGIN.bottom;

  // clean up elements from the previous line graph
  svg.selectAll(".temp").remove();

  // the max value for the y axis
  let max_y_axis_value = -1;
  let value = -1;
  let min_year = 3000;
  let max_year = 0;

  // the data that will be applied for each restaurant
  let restaurant_data = [];

  for (let i = 0; i < current_restaurant.inspections.length; i++) {
    total_violations = current_restaurant.inspections[i].total_violations();
    if (mode == 1) {
      value = total_violations[0];
    } else if (mode == 2) {
      value = total_violations[1] + total_violations[2];
    } else {
      value = total_violations[0] + total_violations[1] + total_violations[2];
    }
    restaurant_data.push([
      new Date(current_restaurant.inspections[i].date),
      value,
    ]);
    if (value > max_y_axis_value) {
      max_y_axis_value = value;
    }
    let year = parseInt(
      current_restaurant.inspections[i].date.substring(
        current_restaurant.inspections[i].date.length - 4
      )
    );
    if (year < min_year) {
      min_year = year;
    }
    if (year > max_year) {
      max_year = year;
    }
  }

  // repeat for restaurant 2
  let restaurant_data_2 = [];
  if (current_restaurant_2) {
    for (let i = 0; i < current_restaurant_2.inspections.length; i++) {
      total_violations = current_restaurant_2.inspections[i].total_violations();
      if (mode == 1) {
        value = total_violations[0];
      } else if (mode == 2) {
        value = total_violations[1] + total_violations[2];
      } else {
        value = total_violations[0] + total_violations[1] + total_violations[2];
      }
      restaurant_data_2.push([
        new Date(current_restaurant_2.inspections[i].date),
        value,
      ]);
      if (value > max_y_axis_value) {
        max_y_axis_value = value;
      }
      let year = parseInt(
        current_restaurant_2.inspections[i].date.substring(
          current_restaurant_2.inspections[i].date.length - 4
        )
      );
      if (year < min_year) {
        min_year = year;
      }
      if (year > max_year) {
        max_year = year;
      }
    }
  }

  let years = [];
  for (let i = min_year; i <= max_year; i++) {
    years.push(i);
  }

  // the data that will be applied for each year in Salt Lake County
  let averages_data = [];
  for (let i = 0; i < years.length; i++) {
    averages_data.push([
      new Date("06/02/" + years[i].toString()),
      pd.averageViolationsPerInspectionPerYear[years[i].toString()][mode],
    ]);
    if (
      Math.ceil(
        pd.averageViolationsPerInspectionPerYear[years[i].toString()][mode]
      ) > max_y_axis_value
    ) {
      max_y_axis_value = Math.ceil(
        pd.averageViolationsPerInspectionPerYear[years[i].toString()][mode]
      );
    }
  }

  // set up scales and axes
  let y_scale_domain = [0, max_y_axis_value];
  let tickValues = [];
  for (let i = 0; i < years.length; i++) {
    tickValues.push(new Date(years[i].toString() + "-01-02"));
  }
  tickValues.push(
    new Date((years[years.length - 1] + 1).toString() + "-01-02")
  );

  let xscale = d3
    .scaleTime()
    .domain([
      new Date(years[0].toString() + "-01-01"),
      new Date((years[years.length - 1] + 1).toString() + "-01-01"),
    ])
    .range([0, chartWidth]);
  let xAxis = d3
    .axisBottom()
    .tickValues(tickValues)
    .tickFormat(d3.timeFormat("%Y"))
    .scale(xscale);
  svg
    .select(".h")
    .attr(
      "transform",
      "translate(" +
        LINECHART_MARGIN.left.toString() +
        "," +
        (chartHeight + LINECHART_MARGIN.top).toString() +
        ")"
    )
    .call(xAxis);

  let yscale = d3.scaleLinear().domain(y_scale_domain).range([chartHeight, 0]);
  let yAxis = d3.axisLeft().scale(yscale);
  svg
    .select(".v")
    .attr(
      "transform",
      "translate(" +
        LINECHART_MARGIN.left.toString() +
        "," +
        LINECHART_MARGIN.top.toString() +
        ")"
    )
    .call(yAxis);

  // draw the actual lines
  let lineFunction = d3
    .line()
    .x((d) => xscale(d[0]) + LINECHART_MARGIN.left)
    .y((d) => yscale(d[1]) + LINECHART_MARGIN.top);

  svg
    .select("#restaurantLine")
    .datum(restaurant_data)
    .attr("d", (d) => lineFunction(d))
    .attr("fill", "none")
    .attr("stroke", "grey")
    .attr("stroke-width", "3px");

  if (current_restaurant_2) {
    svg
      .select("#restaurantLine2")
      .datum(restaurant_data_2)
      .attr("d", (d) => lineFunction(d))
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", "3px")
      .style("display", "inline");
  } else {
    svg.select("#restaurantLine2").style("display", "none");
  }

  svg
    .select("#averageLine")
    .datum(averages_data)
    .attr("d", (d) => lineFunction(d))
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", "3px")
    .attr("stroke-dasharray", "5,3");

  let title = "Number of violations per inspection";
  if (mode == 1) {
    title = "Number of non-critical violations per inspection";
  } else if (mode == 2) {
    title = "Number of critical violations per inspection";
  }

  // add the title
  let titleElt = svg
    .append("text")
    .attr("x", LINECHART_MARGIN.left + chartWidth / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("class", "temp")
    .attr("id", "chart-title")
    .text(title);

    let descriptionString = "Each vertex on one of the lines corresponding to a restaurant represents a specific health inspection that took place. If a restaurant has very few data points, that likely means that it closed. As you might imagine, it not common for restaurants with many violations to stay open for very long. However, as you may see, it happens more than you might initially guess."

    svg.append("circle")
    .attr("cx", LINECHART_MARGIN.left + chartWidth / 2 + titleElt.node().getComputedTextLength() / 2 + 30)
    .attr("cy", 22)
    .attr("r", 12)
    .attr("class", "temp")
    .attr("fill", "#33C3F0")
    .on("mouseover", function (e, d) {
      tooltip
        .html(descriptionString)
        .style("opacity", 1)
        .style("left", (e.pageX + 10).toString() + "px")
        .style("top", (e.pageY - 15).toString() + "px");
    })
    .on("mouseout", function (e, d) {
      tooltip.style("opacity", 0);
    });    
  
  svg.append("text")
    .style("fill", "white")
    .attr("class", "temp")    
    .text("?")
    .attr("x", LINECHART_MARGIN.left + chartWidth / 2 + titleElt.node().getComputedTextLength() / 2 + 25)
    .attr("y", 29)
    .style("font-size", "17px")
    .style("font-weight", "bold")
    .on("mouseover", function (e, d) {
      tooltip
        .html(descriptionString)
        .style("opacity", 1)
        .style("left", (e.pageX + 10).toString() + "px")
        .style("top", (e.pageY - 15).toString() + "px");
    })
    .on("mouseout", function (e, d) {
      tooltip.style("opacity", 0);
    });   

  // do the tooltip hovering
  // based on this article: https://medium.com/@kj_schmidt/show-data-on-mouse-over-with-d3-js-3bf598ff8fc2

  tooltip = d3.select("#tooltip");

  // add vertices to each line:
  svg
    .select("#restaurantVertices")
    .selectAll("circle")
    .data(restaurant_data)
    .enter()
    .append("circle")
    .attr("class", "temp")
    .attr("cx", (d) => xscale(d[0]) + LINECHART_MARGIN.left)
    .attr("cy", (d) => yscale(d[1]) + LINECHART_MARGIN.top)
    .attr("r", 5)
    .attr("fill", "#4a4a4a")
    .on("mouseover", function (e, d) {
      d3.select(this).attr("fill", "black");
      tooltip
        .html(d[0].toLocaleDateString("en-US") + "<br>" + d[1].toString())
        .style("opacity", 1)
        .style("left", (e.pageX + 10).toString() + "px")
        .style("top", (e.pageY - 15).toString() + "px");
    })
    .on("mouseout", function (e, d) {
      d3.select(this).attr("fill", "#4a4a4a");
      tooltip.style("opacity", 0);
    });

  if (current_restaurant_2) {
    svg
      .select("#restaurantVertices2")
      .selectAll("circle")
      .data(restaurant_data_2)
      .enter()
      .append("circle")
      .attr("class", "temp")
      .attr("cx", (d) => xscale(d[0]) + LINECHART_MARGIN.left)
      .attr("cy", (d) => yscale(d[1]) + LINECHART_MARGIN.top)
      .attr("r", 5)
      .attr("fill", "#0013ba")
      .on("mouseover", function (e, d) {
        d3.select(this).attr("fill", "black");
        tooltip
          .html(d[0].toLocaleDateString("en-US") + "<br>" + d[1].toString())
          .style("opacity", 1)
          .style("left", (e.pageX + 10).toString() + "px")
          .style("top", (e.pageY - 15).toString() + "px");
      })
      .on("mouseout", function (e, d) {
        d3.select(this).attr("fill", "#0013ba");
        tooltip.style("opacity", 0);
      });
  }

  svg
    .select("#averageVertices")
    .selectAll("circle")
    .data(averages_data)
    .enter()
    .append("circle")
    .attr("class", "temp")
    .attr("cx", (d) => xscale(d[0]) + LINECHART_MARGIN.left)
    .attr("cy", (d) => yscale(d[1]) + LINECHART_MARGIN.top)
    .attr("r", 5)
    .attr("fill", "#ab0000")
    .on("mouseover", function (e, d) {
      d3.select(this).attr("fill", "black");
      tooltip
        .html(
          (d[0].getYear() + 1900).toString() +
            " average" +
            "<br>" +
            (Math.round(d[1] * 100) / 100).toString()
        )
        .style("opacity", 1)
        .style("left", (e.pageX + 10).toString() + "px")
        .style("top", (e.pageY - 15).toString() + "px");
    })
    .on("mouseout", function (e, d) {
      d3.select(this).attr("fill", "#ab0000");
      tooltip.style("opacity", 0);
    });

  // add the legend

  averageTitleY = 30;
  if (current_restaurant_2) {
    averageTitleY = 60;
  }

  let legendBaseY = legendOffset + 15;
  svg
    .append("circle")
    .attr("cx", LINECHART_MARGIN.left)
    .attr("cy", legendBaseY)
    .attr("r", 5)
    .attr("class", "temp")
    .style("fill", "#4a4a4a");
  svg
    .append("text")
    .attr("x", 20 + LINECHART_MARGIN.left)
    .attr("y", legendBaseY)
    .attr("class", "temp")
    .text(function () {
      if (current_restaurant_2) {
        return current_restaurant_2.name === current_restaurant.name
          ? `${current_restaurant.name} (${current_restaurant.address})`
          : current_restaurant.name;
      } else {
        return current_restaurant.name;
      }
    })
    .style("font-size", `${legendFontSize}px`)
    .attr("dominant-baseline", "central")
    .style("alignment-baseline", "middle");

  if (current_restaurant_2) {
    svg
      .append("circle")
      .attr("cx", LINECHART_MARGIN.left)
      .attr("cy", legendBaseY + 30)
      .attr("r", 5)
      .attr("class", "temp")
      .style("fill", "#0013ba");
    svg
      .append("text")
      .attr("x", 20 + LINECHART_MARGIN.left)
      .attr("y", legendBaseY + 30)
      .attr("class", "temp")
      .text(function () {
        return current_restaurant_2.name === current_restaurant.name
          ? `${current_restaurant_2.name} (${current_restaurant_2.address})`
          : current_restaurant_2.name;
      })
      .style("font-size", `${legendFontSize}px`)
      .attr("dominant-baseline", "central")
      .style("alignment-baseline", "middle");
  }

  svg
    .append("circle")
    .attr("cx", LINECHART_MARGIN.left)
    .attr("cy", legendBaseY + averageTitleY)
    .attr("r", 5)
    .attr("class", "temp")
    .style("fill", "#ab0000");
  svg
    .append("text")
    .attr("x", 20 + LINECHART_MARGIN.left)
    .attr("y", legendBaseY + averageTitleY)
    .attr("class", "temp")
    .text("Salt Lake County Average")
    .style("font-size", `${legendFontSize}px`)
    .attr("dominant-baseline", "central")
    .style("alignment-baseline", "middle");
}

function drawBarChart() {
  /* Prepare Data for SLC Averages */
  // get the average number of non-critical, critical 1, and critical 2 violations
  avgTotal = pd.averageViolationsPerInspection[0];
  avgCrit = pd.averageViolationsPerInspection[1];
  avgNonCrit = pd.averageViolationsPerInspection[2];

  let yoffset = 15;

  // create dictionary to use for drawing bars, start by adding in slc average
  let barData = [
    {
      name: "Salt Lake County Average",
      avgcrit: avgCrit,
      avgnoncrit: avgNonCrit,
    },
  ];
  // to hold the max violations of slc vs rest1 vs rest2
  let maxViolations = avgTotal;

  // get selected restaurants
  restaurants = [];
  if (current_restaurant_2) {
    // if the second restaurant has the same name as the first selected restaurant,
    // add in parentheses "(Restaurant 2)"
    if (current_restaurant_2.name === current_restaurant.name) {
      // ref: https://stackoverflow.com/questions/29050004/modifying-a-copy-of-a-javascript-object-is-causing-the-original-object-to-change
      let tmp1_restaurant = Object.assign({}, current_restaurant);
      let tmp2_restaurant = Object.assign({}, current_restaurant_2);
      tmp1_restaurant.name = `${current_restaurant.name} (${current_restaurant.address})`;
      tmp2_restaurant.name = `${current_restaurant_2.name} (${current_restaurant_2.address})`;
      restaurants.push(tmp1_restaurant);
      restaurants.push(tmp2_restaurant);
    } else {
      restaurants.push(current_restaurant);
      restaurants.push(current_restaurant_2);
    }
  } else {
    restaurants.push(current_restaurant);
  }

  // calculate averages of restaurant's inspections and store in dictionary
  for (let i = 0; i < restaurants.length; i++) {
    // get violation array, sum values in array
    avg_violations = restaurants[i].average_violations;
    // add restaurant to barData
    barData.push({
      name: restaurants[i].name,
      avgcrit: avg_violations[1] + avg_violations[2],
      avgnoncrit: avg_violations[0],
    });
    // plus 1 bc barData[0] is avgs
    currBar = barData[i + 1];
    maxViolations = d3.max([
      maxViolations,
      [currBar.avgcrit, currBar.avgnoncrit].reduce(
        (partialSum, a) => partialSum + a,
        0
      ),
    ]);
  }

  // get subgroups to display as a stacked bar:
  // ref: https://d3-graph-gallery.com/graph/barplot_stacked_basicWide.html
  // ref: https://observablehq.com/@stuartathompson/a-step-by-step-guide-to-the-d3-v4-stacked-bar-chart
  let keys = ["avgnoncrit", "avgcrit"];
  let stack = d3.stack().keys(keys)(barData);
  // map keys onto data to label subgroups by color
  stack.map((d, i) => {
    d.map((d) => {
      d.key = keys[i];
      return d;
    });
    return d;
  });

  // dynamically determine barchart width based on size of window
  let svg = d3.select("#barChartSvg");
  let boxWidth = parseInt(
    svg.style("width").substring(0, svg.style("width").length - 2)
  );
  let boxHeight = svg
    .style("height")
    .substring(0, svg.style("height").length - 2);
  let chartWidth = boxWidth - BARCHART_MARGIN.right - BARCHART_MARGIN.right;
  let chartHeight = boxHeight - BARCHART_MARGIN.bottom - BARCHART_MARGIN.top;
  // console.log(`chartHeight:chartWidth = ${chartHeight}:${chartWidth}`);

  /* Create X-Axis */
  // an array of the appropriate tick labels
  let tickLabels = ["Salt Lake County Average"];
  for (let i = 0; i < restaurants.length; i++) {
    if (restaurants[i]) {
      tickLabels.push(restaurants[i].name);
    }
  }

  // domain is just the 2 aggregates we wanna show
  let xScale = d3
    .scalePoint()
    .domain(tickLabels)
    .range([BARCHART_MARGIN.left, chartWidth - BARCHART_MARGIN.right])
    .padding([0.7]);

  //draw the x-axis
  d3.select("#barChart-x-axis")
    .attr(
      "transform",
      `translate(0, ${yoffset + chartHeight - BARCHART_MARGIN.bottom})`
    )
    .call(d3.axisBottom(xScale).tickFormat((d, i) => tickLabels[i]))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", ".16em")
    // .attr("dy", "-.30em")
    .attr("transform", "rotate(-15)");

  /* Create Y-Axis */
  // determine domain for y-axis
  let y_scale_domain = [0, maxViolations];

  // create yscale
  let yScale = d3
    .scaleLinear()
    .domain(y_scale_domain)
    .range([chartHeight - BARCHART_MARGIN.bottom, BARCHART_MARGIN.top]);

  //draw y axis
  let yAxis = d3
    .select("#barChart-y-axis")
    .attr("transform", `translate(${BARCHART_MARGIN.left}, ${yoffset})`)
    .call(d3.axisLeft(yScale));

  /* Draw the Bars, Legend, and interactivity */
  // ref: https://d3-graph-gallery.com/graph/barplot_stacked_basicWide.html
  // colors to use for the bars and legend
  let colors = [
    ["avgcrit", "#f1a340"],
    ["avgnoncrit", "#998ec3"],
  ];

  // delete all barchart temporary elements
  d3.selectAll(".barChart-temp").remove();

  // as done by Nathan above
  // based on this article: https://medium.com/@kj_schmidt/show-data-on-mouse-over-with-d3-js-3bf598ff8fc2
  let tooltip = d3.select("#tooltip");

  // define bar width
  let barWidth = chartWidth / 10;
  svg
    .append("g")
    .attr("class", "barChart-temp")
    .selectAll("g")
    .data(stack)
    .enter()
    .append("g")
    .selectAll("rect")
    .data((d) => d)
    .enter()
    .append("rect")
    .attr("class", "barChart-temp")
    .attr("id", "bar")
    .attr("x", (d) => xScale(d.data.name) - barWidth / 2)
    .attr("width", barWidth)
    .attr("height", (d) => {
      return yScale(d[0]) - yScale(d[1]);
    })
    .attr("y", (d) => yScale(d[1]) + yoffset)
    .attr("fill", (d) => {
      if (d.key == "avgcrit") {
        return colors[0][1];
      }
      if (d.key == "avgnoncrit") {
        return colors[1][1];
      }
    })
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .on("mouseover", function (e, d) {
      // lighten the rectangle to indicated its being hovered over
      d3.select(this).attr("opacity", ".85");
      // get the average violations for the subgroup being hovered over, to nearest 10ths place
      let avg = Math.round(d.data[d.key] * 10) / 10;
      // label based on key (avgcrit or avgnoncrit)
      let label =
        d.key === "avgcrit"
          ? "Average Critical Violations:"
          : "Average Non-Critical Violations";
      tooltip
        .html(`${label} <br> ${avg}`)
        .style("opacity", 1)
        .style("left", (e.pageX + 10).toString() + "px")
        .style("top", (e.pageY - 15).toString() + "px");
    })
    .on("mouseout", function (e, d) {
      d3.select(this).attr("opacity", "1");
      tooltip.style("opacity", 0);
    });

  // add legend
  // ref: https://stackoverflow.com/questions/16178710/d3js-create-legend-for-bar-chart
  let legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("class", "barChart-temp")
    //.attr("x", w - 65)
    //.attr("y", 50)
    .attr("height", 100)
    .attr("width", 100)
    .attr("transform", "translate(-20,50)");

  let legendRect = legend.selectAll("rect").data(colors);
  let legendRectXPos = chartWidth - BARCHART_MARGIN.left - chartWidth / 8;
  legendRect
    .enter()
    .append("rect")
    .attr("class", "barChart-temp")
    .attr("x", legendRectXPos)
    .attr("width", 10)
    .attr("height", 10)
    .attr("y", function (d, i) {
      return i * 20;
    })
    .style("fill", function (d) {
      return d[1];
    })
    .attr("stroke", "black")
    .attr("stroke-width", 0.5);

  let legendText = legend.selectAll("text").data(colors);

  legendText
    .enter()
    .append("text")
    .attr("class", "barChart-temp")
    .attr("x", legendRectXPos + d3.max([legendRectXPos / 30, 15]))
    .attr("y", function (d, i) {
      return i * 20 + 9;
    })
    .text(function (d) {
      return d[0] === "avgcrit"
        ? "Avg. Critical Violations:"
        : "Avg. Non-Critical Violations";
    })
    .style("font-size", `${legendFontSize}px`);

  // create title
  let title = "Average Violations per Inspection";
  // update the title
  // d3.select("#barChart-title").remove();
  let titleElt =
    svg.append("text")
    .attr("class", "barChart-temp")
    .attr("id", "chart-title")
    .attr("x", boxWidth / 2)
    .attr("y", yoffset + BARCHART_MARGIN.top - chartHeight / 15)
    .attr("text-anchor", "middle")
    .text(title);

    let descriptionString = "The height of each bar corresponds to the average number of violations that occur per inspection. While not rigorously defined, a critical violation is a type of violation that could possibly lead to foodborne illness. A non-critical violation, while likely not to lead to illness, is still of concern."

    svg.append("circle")
    .attr("cx", boxWidth / 2 + titleElt.node().getComputedTextLength() / 2 + 30)
    .attr("cy", yoffset + BARCHART_MARGIN.top - chartHeight / 15 - 8)
    .attr("r", 12)
    .attr("class", "barChart-temp")
    .attr("fill", "#33C3F0")
    .on("mouseover", function (e, d) {
      tooltip
        .html(descriptionString)
        .style("opacity", 1)
        .style("left", (e.pageX + 10).toString() + "px")
        .style("top", (e.pageY - 15).toString() + "px");
    })
    .on("mouseout", function (e, d) {
      tooltip.style("opacity", 0);
    });    
  
  svg.append("text")
    .style("fill", "white")
    .attr("class", "barChart-temp")    
    .text("?")
    .attr("x", boxWidth / 2 + titleElt.node().getComputedTextLength() / 2 + 25)
    .attr("y", yoffset + BARCHART_MARGIN.top - chartHeight / 15 - 1)
    .style("font-size", "17px")
    .style("font-weight", "bold")
    .on("mouseover", function (e, d) {
      tooltip
        .html(descriptionString)
        .style("opacity", 1)
        .style("left", (e.pageX + 10).toString() + "px")
        .style("top", (e.pageY - 15).toString() + "px");
    })
    .on("mouseout", function (e, d) {
      tooltip.style("opacity", 0);
    });        

}

// Function to extract the first two parts of the id
function getGroupKey(id) {
  const parts = id.split(".");
  return parts.slice(0, 1).join(".");
}

function bubbleChartDataProcessing(firstRestaurant) {
  let restaurant = current_restaurant;
  if (!firstRestaurant) {
    restaurant = current_restaurant_2;
  }

  const violationCounts = {};

  restaurant.inspections.forEach((inspection) => {
    inspection.violations.forEach((violation) => {
      const code = `${violation.family}.${violation.code}`;
      // If the code doesn't exist in the violationCounts object, initialize it
      if (!violationCounts[code]) {
        violationCounts[code] = {
          occurrences: 0,
          description: violation.description, // assuming `description` is a property of violation
        };
      }
      // Add the occurrences for this violation
      violationCounts[code].occurrences += violation.occurrences;
    });
  });

  // assemble the hierarchy
  let codeFamilies = {};
  let data = Object.keys(violationCounts);

  // first, make lists of all codes grouped by parent
  for (let i = 0; i < data.length; i++) {
    let code = data[i];
    let parts = code.split(".");
    let leaf = {
      id: parts[1] + "." + parts[2],
      value: violationCounts[code].occurrences,
      description: violationCounts[code].description,
    };
    if (parts[1] in codeFamilies) {
      codeFamilies[parts[1]].children.push(leaf);
    } else {
      codeFamilies[parts[1]] = { id: parts[1], children: [leaf] };
    }
  }

  // then assemble all of the parents into one rooted hierarchy
  let codeFamiliesKeys = Object.keys(codeFamilies);
  let hierarchy = { children: [] };
  for (let i = 0; i < codeFamiliesKeys.length; i++) {
    codeFamilies[codeFamiliesKeys[i]]["value"] = 0;
    hierarchy.children.push(codeFamilies[codeFamiliesKeys[i]]);
  }

  return [hierarchy, codeFamiliesKeys];
}

function drawBubbleChartBubbles(
  bsvg,
  hierarchy,
  size,
  color,
  translateX,
  number
) {
  let legendchartspace = 50; // space between legend and chart
  const format = d3.format(",d");
  const pack = d3.pack().size(size);
  // const root = pack(d3.hierarchy({ children: data }).sum(d => d.value));
  const root = pack(d3.hierarchy(hierarchy).sum((d) => d.value));

  if (hierarchy.children.length != 0) {
    const packG = bsvg
      .append("g")
      .attr(
        "transform",
        `translate(${BUBBLECHART_MARGIN.left + translateX},${
          BUBBLECHART_MARGIN.top + legendchartspace
        })`
      )
      .attr("class", "bubbleChart-temp")
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .attr("class", "bubbleChart-temp");

    // define the tooltip element
    let tooltip = d3.select("#tooltip");

    function sIfPlural(number) {
      if (number == 1) {
        return "";
      } else {
        return "s";
      }
    }

    packG
      .append("circle")
      .attr("id", (d) => "c" + number + "-" + d.data.id.replace(".", "-"))
      .attr("fill-opacity", 0.7)
      .attr("fill", (d) => color(getGroupKey(d.data.id)))
      .attr("class", "bubbleChart-temp")
      .attr("class", "bubbleChart-circle")
      .attr("stroke", "black")
      .attr("stroke-width", 3)
      .attr("stroke-opacity", 0)
      .attr("r", (d) => d.r)
      .on("mouseover", function (event, d) {
        tooltip.style("opacity", 1);
        tooltip
          .html(
            `4.${d.data.id}: ${d.data.description.replaceAll("*", "")} (${
              d.data.value
            } occurrence${sIfPlural(d.data.value)})`
          )
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
        d3.selectAll(".bubbleChart-circle").attr("stroke-opacity", 0);
        d3.select(this).attr("stroke-opacity", 0.5);
      })
      .on("mouseout", function (d) {
        tooltip.style("opacity", 0);
        d3.selectAll(".bubbleChart-circle").attr("stroke-opacity", 0);
      });

    packG
      .append("text")
      .selectAll("tspan")
      .data((d) => [[format(d.value), d.r, d.data.id]]) // Combine ID and value in one array
      .enter()
      .append("tspan")
      .on("mouseover", function (event, d) {
        tooltip.style("opacity", 1);
        d3.selectAll(".bubbleChart-circle").attr("stroke-opacity", 0);
        let parent = d3
          .select("#c" + number + "-" + d[2].replace(".", "-"))
          .attr("stroke-opacity", 0.5);
      })
      .on("mouseout", function (d) {
        tooltip.style("opacity", 0);
        d3.selectAll(".bubbleChart-circle").attr("stroke-opacity", 0);
      })
      .attr("text-anchor", "middle")
      .attr("y", 2)
      .text((d) => d[0])
      .attr("dominant-baseline", "central")
      .style("alignment-baseline", "middle")
      .style("cursor", "default")
      .style("font-size", function (d, i) {
        testSize = d[1] / 20;
        if (testSize > 5) {
          testSize = 5;
        }
        if (testSize < 1) {
          if (d[1] / 10 < 1) {
            testSize = 0;
          } else {
            testSize = 1;
          }
        }
        return `${testSize}rem`;
      });
  } else {
    bsvg
      .append("text")
      .attr("x", BUBBLECHART_MARGIN.left + size[0] / 2 + translateX)
      .attr("y", BUBBLECHART_MARGIN.top + size[1] / 2)
      .attr("text-anchor", "middle")
      .attr("class", "bubbleChart-temp")
      .text("This restaurant had no violations");
  }
}

function drawBubblechart() {
  let legendY = 30;
  let legendYOffset = 20; // Space for title
  let legendRowHeight = 22; // Adjust as necessary
  let legendSquareSize = 12; // Size of the color square in the legend
  let legendSquareSpacing = 4; // Space between square and text
  let legendItemSpacing = 30; // space between items in the legend

  // get the svg element
  let svg = d3.select("#bubbleChart").select("svg");

  // delete all bubblechart temporary elements
  d3.selectAll(".bubbleChart-temp").remove();

  // dynamically determine bubblechart width based on size of window
  let boxWidth = parseInt(
    svg.style("width").substring(0, svg.style("width").length - 2)
  );
  let boxHeight = parseInt(
    svg.style("height").substring(0, svg.style("height").length - 2)
  );

  let chartWidth =
    boxWidth - BUBBLECHART_MARGIN.right - BUBBLECHART_MARGIN.left;
  let chartHeight =
    boxHeight - BUBBLECHART_MARGIN.bottom - BUBBLECHART_MARGIN.top;

  const color = d3.scaleOrdinal(d3.schemeSet2); //It has 8 distinct colors

  // Process the data
  dataProcessing1Output = bubbleChartDataProcessing(true);
  hierarchy = dataProcessing1Output[0];
  codeFamilies = dataProcessing1Output[1];

  let hierarchy2 = null;
  if (current_restaurant_2) {
    dataProcessing2Output = bubbleChartDataProcessing(false);
    hierarchy2 = dataProcessing2Output[0];
    codeFamilies2 = dataProcessing2Output[1];
    for (let i = 0; i < codeFamilies2.length; i++) {
      if (!codeFamilies.includes(codeFamilies2[i]))
        codeFamilies.push(codeFamilies2[i]);
    }
  }

  codeFamilies.sort();

  const bsvg = d3.select("#bubbleChart").select("svg");

  let title = "Breakdown of Violations";

  // Legend definitions
  const legendDefs = {
    4.1: "Employee Training and Certification",
    4.2: "Management and Personnel",
    4.3: "Food Characteristics",
    4.4: "Equipment",
    4.5: "Water, Plumbing and Waste",
    4.6: "Physical Facilities",
    4.7: "Poisonous or Toxic Materials",
    4.8: "Plan Submitted or Approved",
    4.9: "Stands and Food Trucks",
    "4.10": "Seasonal",
  };

  let legendData = codeFamilies.map((key) => ({
    key: key,
    code: "4." + key,
    text: legendDefs["4." + key],
  }));

  // console.log(legendData)

  let titleElt = bsvg
    .append("text")
    .attr("x", BUBBLECHART_MARGIN.left + chartWidth / 2)
    .attr("y", legendY)
    .attr("text-anchor", "middle")
    .attr("class", "bubbleChart-temp")
    .attr("id", "chart-title")
    .text(title);

    let descriptionString = "A violation is a specific thing that a health inspector can find wrong with a restaurant. Each bubble corresponds to a different specific violation. Bubbles are coded by what overall category of violation they belong to according to the Salt Lake County Health Department."

  bsvg.append("circle")
    .attr("cx", BUBBLECHART_MARGIN.left + chartWidth / 2 + titleElt.node().getComputedTextLength() / 2 + 30)
    .attr("cy", legendY - 8)
    .attr("r", 12)
    .attr("class", "bubbleChart-temp")    
    .attr("fill", "#33C3F0")
    .on("mouseover", function (e, d) {
      tooltip
        .html(descriptionString)
        .style("opacity", 1)
        .style("left", (e.pageX + 10).toString() + "px")
        .style("top", (e.pageY - 15).toString() + "px");
    })
    .on("mouseout", function (e, d) {
      tooltip.style("opacity", 0);
    });    
  
  bsvg.append("text")
    .style("fill", "white")
    .text("?")
    .attr("class", "bubbleChart-temp")
    .attr("x", BUBBLECHART_MARGIN.left + chartWidth / 2 + titleElt.node().getComputedTextLength() / 2 + 25)
    .attr("y", legendY-1)
    .style("font-size", "17px")
    .style("font-weight", "bold")
    .on("mouseover", function (e, d) {
      tooltip
        .html(descriptionString)
        .style("opacity", 1)
        .style("left", (e.pageX + 10).toString() + "px")
        .style("top", (e.pageY - 15).toString() + "px");
    })
    .on("mouseout", function (e, d) {
      tooltip.style("opacity", 0);
    });        

  // Add the legend

  // Legend container
  const legendContainer = bsvg
    .append("g")
    .attr("class", "bubbleChart-temp")
    .attr(
      "transform",
      `translate(${BUBBLECHART_MARGIN.left}, ${BUBBLECHART_MARGIN.top})`
    );

  // helper function for creating the legend
  function populateLegendItem(legend, legendItem) {
    // Add color square
    legendItem
      .append("rect")
      .attr("width", legendSquareSize)
      .attr("height", legendSquareSize)
      .attr("class", "bubbleChart-temp")
      .style("fill", color(getGroupKey(legend.key)));

    // Add text
    let text = legendItem
      .append("text")
      .attr("x", legendSquareSize + legendSquareSpacing)
      .attr("y", legendSquareSize / 2 + legendSquareSpacing / 2)
      .text(`${legend.code}: ${legend.text}`)
      .attr("class", "bubbleChart-temp")
      .attr("dominant-baseline", "central")
      .style("alignment-baseline", "middle");

    return text;
  }

  // Legend data preparation
  let legendRows = 1;
  let currentRow = legendContainer.append("g");
  let currentRowWidth = 0;

  // Create legend items and measure widths

  legendData.forEach((legend, index) => {
    let legendItem = currentRow.append("g");
    let text = populateLegendItem(legend, legendItem);
    // Group for the legend item

    // Measure width
    let itemWidth =
      legendSquareSize +
      legendSquareSpacing +
      text.node().getComputedTextLength();

    if (currentRowWidth + itemWidth > chartWidth) {
      // If adding item to the row would take up too much space, put the current row into place and start a new row
      currentRowWidth -= legendItemSpacing;
      legendItem.remove();

      //currentRowWidth -= legendItemSpacing;
      currentRow.attr(
        "transform",
        `translate(${(chartWidth - currentRowWidth) / 2}, ${
          (legendRows - 1) * legendRowHeight
        })`
      );

      legendRows++;
      currentRow = legendContainer.append("g");
      legendItem = currentRow.append("g");
      populateLegendItem(legend, legendItem);
      currentRowWidth = itemWidth + legendItemSpacing;
    } else {
      // otherwise, put the element into place

      // Position group
      legendItem.attr("transform", `translate(${currentRowWidth}, 0)`);

      // Update current width
      currentRowWidth += itemWidth + legendItemSpacing;
    }
  });

  // put final row into place
  currentRowWidth -= legendItemSpacing;
  currentRow.attr(
    "transform",
    `translate(${(chartWidth - currentRowWidth) / 2}, ${
      (legendRows - 1) * legendRowHeight
    })`
  );

  // Adjust height for legend container based on number of rows
  legendContainer.attr(
    "transform",
    `translate(${BUBBLECHART_MARGIN.left}, ${legendYOffset + 30})`
  );

  if (current_restaurant_2) {
    // draw individual chart titles
    bsvg
      .append("text")
      .attr("x", BUBBLECHART_MARGIN.left + chartWidth / 4)
      .attr("y", chartHeight)
      .attr("text-anchor", "middle")
      .attr("class", "bubbleChart-temp")
      .text(function () {
        return current_restaurant_2.name === current_restaurant.name
          ? `${current_restaurant.name} (${current_restaurant.address})`
          : current_restaurant.name;
      });

    bsvg
      .append("text")
      .attr("x", BUBBLECHART_MARGIN.left + (3.18 * chartWidth) / 4)
      .attr("y", chartHeight)
      .attr("text-anchor", "middle")
      .attr("class", "bubbleChart-temp")
      .text(function () {
        return current_restaurant_2.name === current_restaurant.name
          ? `${current_restaurant_2.name} (${current_restaurant_2.address})`
          : current_restaurant_2.name;
      });

    const adjustedChartHeight =
      chartHeight - legendYOffset - legendRowHeight * (legendRows + 2);
    // Drawing the dividing line
    bsvg
      .append("line")
      .attr("x1", chartWidth / 2 + BUBBLECHART_MARGIN.left)
      .attr("y1", BUBBLECHART_MARGIN.top + legendRowHeight * (legendRows + 1))
      .attr("x2", chartWidth / 2 + BUBBLECHART_MARGIN.left)
      .attr("y2", chartHeight + BUBBLECHART_MARGIN.bottom)
      .attr("stroke", "#ccc") // Color of the line
      .attr("class", "bubbleChart-temp")
      .attr("stroke-width", 1); // Thickness of the line

    drawBubbleChartBubbles(
      bsvg,
      hierarchy,
      [chartWidth / 2 - 20, adjustedChartHeight],
      color,
      0,
      "1"
    );
    drawBubbleChartBubbles(
      bsvg,
      hierarchy2,
      [chartWidth / 2 - 20, adjustedChartHeight],
      color,
      chartWidth / 2 + 40,
      "2"
    );
  } else {
    const adjustedChartHeight =
      chartHeight - legendYOffset - legendRowHeight * legendRows;
    drawBubbleChartBubbles(
      bsvg,
      hierarchy,
      [chartWidth, adjustedChartHeight],
      color,
      0,
      "1"
    );
  }
}
