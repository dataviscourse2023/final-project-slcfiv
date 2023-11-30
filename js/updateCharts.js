// Constants for the charts, that would be useful.
const BARCHART_MARGIN = { left: 50, bottom: 50, top: 50, right: 100 };
const BUBBLECHART_MARGIN = { left: 50, bottom: 10, top: 50, right: 100};
const LINECHART_MARGIN = {left: 30, bottom: 20, top: 150, right: 30};

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
  d3.selectAll("#tooltip").remove();

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
    .attr("stroke", "green")
    .attr("stroke-width", "3px");

  if (current_restaurant_2) {
    svg
      .select("#restaurantLine2")
      .datum(restaurant_data_2)
      .attr("d", (d) => lineFunction(d))
      .attr("fill", "none")
      .attr("stroke", "red")
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
    .attr("stroke", "steelblue")
    .attr("stroke-width", "3px");

  let title = "Number of violations per inspection";
  if (mode == 1) {
    title = "Number of non-critical violations per inspection";
  } else if (mode == 2) {
    title = "Number of critical violations per inspection";
  }

  // add the title
  svg
    .append("text")
    .attr("x", LINECHART_MARGIN.left + chartWidth / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("class", "temp")
    .attr("id", "chart-title")
    .text(title);

  // do the tooltip hovering
  // based on this article: https://medium.com/@kj_schmidt/show-data-on-mouse-over-with-d3-js-3bf598ff8fc2

  // define the tooltip element
  let tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "temp")
    .attr("id", "tooltip")
    .style("opacity", 0);

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
    .attr("fill", "darkgreen")
    .on("mouseover", function (e, d) {
      d3.select(this).attr("fill", "black");
      tooltip
        .html(d[0].toLocaleDateString("en-US") + "<br>" + d[1].toString())
        .style("opacity", 1)
        .style("left", (e.pageX + 10).toString() + "px")
        .style("top", (e.pageY - 15).toString() + "px");
    })
    .on("mouseout", function (e, d) {
      d3.select(this).attr("fill", "darkgreen");
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
      .attr("fill", "maroon")
      .on("mouseover", function (e, d) {
        d3.select(this).attr("fill", "black");
        tooltip
          .html(d[0].toLocaleDateString("en-US") + "<br>" + d[1].toString())
          .style("opacity", 1)
          .style("left", (e.pageX + 10).toString() + "px")
          .style("top", (e.pageY - 15).toString() + "px");
      })
      .on("mouseout", function (e, d) {
        d3.select(this).attr("fill", "maroon");
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
    .attr("fill", "darkblue")
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
      d3.select(this).attr("fill", "darkblue");
      tooltip.style("opacity", 0);
    });

  // add the legend

  averageTitleY = 30;
  if (current_restaurant_2) {
    averageTitleY = 60;
  }

  let legendBaseY = legendOffset
  svg
    .append("circle")
    .attr("cx", LINECHART_MARGIN.left)
    .attr("cy", legendBaseY)
    .attr("r", 5)
    .attr("class", "temp")
    .style("fill", "darkgreen");
  svg
    .append("text")
    .attr("x", 20 + LINECHART_MARGIN.left)
    .attr("y", legendBaseY + 5)
    .attr("class", "temp")
    .text(current_restaurant.name)
    .style("font-size", `${legendFontSize}px`)
    .attr("alignment-baseline", "middle");

  if (current_restaurant_2) {
    svg
      .append("circle")
      .attr("cx", LINECHART_MARGIN.left)
      .attr("cy", legendBaseY + 30)
      .attr("r", 5)
      .attr("class", "temp")
      .style("fill", "maroon");
    svg
      .append("text")
      .attr("x", 20 + LINECHART_MARGIN.left)
      .attr("y", legendBaseY + 35)
      .attr("class", "temp")
      .text(current_restaurant_2.name)
      .style("font-size", `${legendFontSize}px`)
      .attr("alignment-baseline", "middle");
  }

  svg
    .append("circle")
    .attr("cx", LINECHART_MARGIN.left)
    .attr("cy", legendBaseY + averageTitleY)
    .attr("r", 5)
    .attr("class", "temp")
    .style("fill", "darkblue");
  svg
    .append("text")
    .attr("x", 20 + LINECHART_MARGIN.left)
    .attr("y", legendBaseY + averageTitleY + 5)
    .attr("class", "temp")
    .text("Salt Lake County Average")
    .style("font-size", `${legendFontSize}px`)
    .attr("alignment-baseline", "middle");
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
  if (current_restaurant) {
    restaurants.push(current_restaurant);
  }
  if (current_restaurant_2) {
    restaurants.push(current_restaurant_2);
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
  console.log(`chartHeight:chartWidth = ${chartHeight}:${chartWidth}`);

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
    .attr("transform", `translate(0, ${yoffset + chartHeight - BARCHART_MARGIN.bottom})`)
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
  let tooltip = d3
    .select("#barChart")
    .append("div")
    .attr("class", "barChart-temp")
    .attr("id", "tooltip")
    .style("opacity", 0);

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
  let title = "Total Average Violations";
  // update the title
  // d3.select("#barChart-title").remove();
  svg
    .append("text")
    .attr("class", "barChart-temp")
    .attr("id", "chart-title")
    .attr("x", boxWidth / 2)
    .attr("y", yoffset + BARCHART_MARGIN.top - chartHeight / 20)
    .attr("text-anchor", "middle")
    .text(title);
}

// first is set to true if we are drawing bubble chart 1, and false if drawing bubble chart 2
function drawBubblechart(first, small) {

  let legendY = 30;
  let legendYOffset = 20; // Space for title
  let legendRowHeight = 22; // Adjust as necessary
  let legendSquareSize = 12; // Size of the color square in the legend
  let legendSquareSpacing = 4; // Space between square and text
  let legendItemSpacing = 30; // space between items in the legend
  let legendchartspace = 50 // space between legend and chart


  // get the svg element
  let svg = d3.select("#bubbleChart").select("svg");
  
  // delete all bubblechart temporary elements
  d3.selectAll(".bubbleChart-temp").remove();
 
  // dynamically determine bubblechart width based on size of window
  let boxWidth = parseInt(
    svg.style("width").substring(0, svg.style("width").length - 2)
  );
  let boxHeight = parseInt(svg
    .style("height")
    .substring(0, svg.style("height").length - 2));
 
  let chartWidth = boxWidth - BUBBLECHART_MARGIN.right - BUBBLECHART_MARGIN.left;
  let chartHeight = boxHeight - BUBBLECHART_MARGIN.bottom - BUBBLECHART_MARGIN.top;

  const format = d3.format(",d");
  const color = d3.scaleOrdinal(d3.schemeSet2); //It has 8 distinct colors




  // Process the data
  const violationCounts = {};

  current_restaurant.inspections.forEach(inspection => {
    inspection.violations.forEach(violation => {
      const code = `${violation.family}.${violation.code}`;
      // If the code doesn't exist in the violationCounts object, initialize it
      if (!violationCounts[code]) {
        violationCounts[code] = {
          occurrences: 0,
          description: violation.description // assuming `description` is a property of violation
        };
      }
      // Add the occurrences for this violation
      violationCounts[code].occurrences += violation.occurrences;
      
    });
  });

  // assemble the hierarchy
  let codeFamilies = {}
  let data = Object.keys(violationCounts)

  // first, make lists of all codes grouped by parent
  for(let i = 0; i < data.length; i++){
    let code = data[i]
    let parts = code.split(".")
    let leaf = { id: parts[1] + "." + parts[2], value: violationCounts[code].occurrences, description: violationCounts[code].description }
    if( parts[1] in codeFamilies ){
      codeFamilies[parts[1]].children.push(leaf)
    }
    else{
      codeFamilies[parts[1]] = {id: parts[1], children: [leaf]}
    }
  }

  // then assemble all of the parents into one rooted hierarchy
  let codeFamiliesKeys = Object.keys(codeFamilies)
  let hierarchy = { children: [] }
  for( let i = 0; i < codeFamiliesKeys.length; i++ ){
    codeFamilies[codeFamiliesKeys[i]]["value"] = 0
    hierarchy.children.push( codeFamilies[codeFamiliesKeys[i]] )
  }

  // Function to extract the first two parts of the id
  function getGroupKey(id) {
    const parts = id.split(".");
    return parts.slice(0, 1).join(".");
  }
  
  const bsvg = d3.select("#bubbleChart").select("svg")
                  
  let title = "Number of violations per code family";

  // Legend definitions
  const legendDefs = {
    "4.1": "Employee Training and Certification",
    "4.2": "Management and Personnel",
    "4.3": "Food Characteristics",
    "4.4": "Equipment",
    "4.5": "Water, Plumbing and Waste",
    "4.6": "Physical Facilities",
    "4.7": "Poisonous or Toxic Materials",
    "4.8": "Plan Submitted or Approved",
    "4.9": "Stands and Food Trucks",
    "4.10": "Seasonal"
  };

  let legendData = Object.keys(codeFamilies)
                          .filter(key => codeFamilies[key].children.length > 0)
                          .map(key => ({ key: key, code: "4." + key, text: legendDefs["4." + key] }));

  console.log(legendData)

  bsvg.append("text")
      .attr("x", BUBBLECHART_MARGIN.left + chartWidth / 2)
      .attr("y", legendY)
      .attr("text-anchor", "middle")
      .attr("class", "bubbleChart-temp")
      .attr("id", "chart-title")
      .text(title);
  
  // Add the legend

  // Legend container
  const legendContainer = bsvg.append("g")
  .attr("class", "bubbleChart-temp")
  .attr("transform", `translate(${BUBBLECHART_MARGIN.left}, ${BUBBLECHART_MARGIN.top})`);


  // Legend data preparation
  let legendRows = 1;
  let currentRow = legendContainer.append("g")
  let currentRowWidth = 0;

  // Create legend items and measure widths
  legendData.forEach((legend, index) => {
    let legendItem = currentRow.append("g");
     // Group for the legend item
    
    // Add color square
    legendItem.append("rect")
      .attr("width", legendSquareSize)
      .attr("height", legendSquareSize)
      .attr("class", "bubbleChart-temp")
      .style("fill", color(getGroupKey(legend.key)));

    // Add text
    let text = legendItem.append("text")
      .attr("x", legendSquareSize + legendSquareSpacing)
      .attr("y", legendSquareSize )
      .text(`${legend.code}: ${legend.text}`)
      .attr("class", "bubbleChart-temp")
      .style("alignment-baseline", "middle");

    // Measure width
    let itemWidth = legendSquareSize + legendSquareSpacing + text.node().getComputedTextLength();

    if (currentRowWidth + itemWidth > chartWidth) {
      // If adding item to the row would take up too much space, put the current row into place and start a new row
      currentRowWidth -= legendItemSpacing;
      let newRow = legendContainer.append("g")
      newRow.append(() => legendItem.node())
      legendItem.remove()

      //currentRowWidth -= legendItemSpacing;
      currentRow.attr("transform", `translate(${(chartWidth - currentRowWidth)/2}, ${ (legendRows-1)*legendRowHeight })`)

      legendRows++;
      currentRowWidth = 0;
      currentRow = newRow
    }
    else{
      // otherwise, put the element into place

      // Position group
      legendItem.attr("transform", `translate(${currentRowWidth}, 0)`);

      // Update current width
      currentRowWidth += itemWidth + legendItemSpacing;
    }
  });

  // put final row into place
  currentRowWidth -= legendItemSpacing;
  currentRow.attr("transform", `translate(${(chartWidth - currentRowWidth)/2}, ${ (legendRows-1)*legendRowHeight })`)    

  // Adjust height for legend container based on number of rows
  legendContainer.attr("transform", `translate(${BUBBLECHART_MARGIN.left}, ${legendYOffset+30})`);

  
  const adjustedChartHeight = chartHeight - legendYOffset - (legendRowHeight * legendRows);
  const pack = d3.pack().size([chartWidth, adjustedChartHeight]);
    // const root = pack(d3.hierarchy({ children: data }).sum(d => d.value));
  const root = pack(d3.hierarchy(hierarchy).sum( d => d.value ))

  const packG = bsvg.append("g")
            .attr("transform", `translate(${BUBBLECHART_MARGIN.left},${BUBBLECHART_MARGIN.top + legendchartspace})`)
            .attr("class", "bubbleChart-temp")
            .selectAll("g")
            .data(root.leaves())
            .enter().append("g")
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .attr("class", "bubbleChart-temp");

  // define the tooltip element
  let tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "bubbleChart-temp")
    .attr("id", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")

  packG.append("circle")
          .attr("id", d => "c" + d.data.id.replace(".", "-"))
          .attr("fill-opacity", 0.7)
          .attr("fill", d => color(getGroupKey(d.data.id)))
          .attr("class", "bubbleChart-temp")
          .attr("class", "bubbleChart-circle")
          .attr("stroke", "black")
          .attr("stroke-width", 3)
          .attr("stroke-opacity", 0)          
          .attr("r", d => d.r)
          .on("mouseover", function(event, d) {
            tooltip.style("opacity", 1);
            tooltip.html(`${d.data.id}: ${d.data.description}`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
            d3.selectAll(".bubbleChart-circle")
              .attr("stroke-opacity", 0)
            d3.select(this)
              .attr("stroke-opacity", 0.5)
        })
        .on("mouseout", function(d) {
            tooltip.style("opacity", 0);
            d3.selectAll(".bubbleChart-circle")
              .attr("stroke-opacity", 0)
    });   

  packG.append("text")
          .selectAll("tspan")
          .data(d => [[d.data.id, d.r, d.data.id.replace(".", "-")], [format(d.value), d.r, d.data.id.replace(".", "-")]]) // Combine ID and value in one array
          .enter().append("tspan")
          .on("mouseover", function(event, d) {
            tooltip.style("opacity", 1);
            d3.selectAll(".bubbleChart-circle")
              .attr("stroke-opacity", 0)
            let parent = d3.select("#c" + d[2])
              .attr("stroke-opacity", 0.5)
            console.log(parent)
          })
          .on("mouseout", function(d) {
              tooltip.style("opacity", 0);
              d3.selectAll(".bubbleChart-circle")
                .attr("stroke-opacity", 0)
          })                    
          .attr("text-anchor", "middle")
          .attr("x", 0)
          .attr("y", (d, i) => `${i * 1.2}em`)
          .text(d => d[0])
          .attr("fill-opacity", (d, i) => i ? 0.8 : 1) // Reduce opacity for the value
          .style("font-size", (d,i) => i ? `${d[1]/30}rem` : `${d[1]/20}rem`)
  
}