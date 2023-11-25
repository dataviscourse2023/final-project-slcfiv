// Constants for the charts, that would be useful.
const chartXOffset = 30;
const chartYOffset = 30;
const MARGIN = { left: 50, bottom: 20, top: 20, right: 20 };

// mode 0: all violations
// mode 1: non critical violations
// mode 2: critical violations
function drawLineGraph() {
  let mode = parseInt(document.getElementById("lineGraphTypeSelection").value);

  let chartRightMargin = 30;
  let chartBottomMargin = 110;

  // how far below the chart the legend begins
  let legendOffset = 30;

  let svg = d3.select("#lineGraph").select("svg");
  let boxWidth = parseInt(
    svg.style("width").substring(0, svg.style("width").length - 2)
  );
  let boxHeight = svg
    .style("height")
    .substring(0, svg.style("height").length - 2);
  let chartWidth = boxWidth - chartXOffset - chartRightMargin;
  let chartHeight = boxHeight - chartYOffset - chartBottomMargin;

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
        chartXOffset.toString() +
        "," +
        (chartHeight + chartYOffset).toString() +
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
        chartXOffset.toString() +
        "," +
        chartYOffset.toString() +
        ")"
    )
    .call(yAxis);

  let lineFunction = d3
    .line()
    .x((d) => xscale(d[0]) + chartXOffset)
    .y((d) => yscale(d[1]) + chartYOffset);

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
    .attr("x", chartXOffset + chartWidth / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .attr("class", "temp")
    .style("font-size", "20px")
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
    .attr("cx", (d) => xscale(d[0]) + chartXOffset)
    .attr("cy", (d) => yscale(d[1]) + chartYOffset)
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
      .attr("cx", (d) => xscale(d[0]) + chartXOffset)
      .attr("cy", (d) => yscale(d[1]) + chartYOffset)
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
    .attr("cx", (d) => xscale(d[0]) + chartXOffset)
    .attr("cy", (d) => yscale(d[1]) + chartYOffset)
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

  let legendBaseY = legendOffset + chartHeight + chartYOffset;
  svg
    .append("circle")
    .attr("cx", chartXOffset)
    .attr("cy", legendBaseY)
    .attr("r", 5)
    .attr("class", "temp")
    .style("fill", "darkgreen");
  svg
    .append("text")
    .attr("x", 20 + chartXOffset)
    .attr("y", legendBaseY + 5)
    .attr("class", "temp")
    .text(current_restaurant.name)
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");

  if (current_restaurant_2) {
    svg
      .append("circle")
      .attr("cx", chartXOffset)
      .attr("cy", legendBaseY + 30)
      .attr("r", 5)
      .attr("class", "temp")
      .style("fill", "maroon");
    svg
      .append("text")
      .attr("x", 20 + chartXOffset)
      .attr("y", legendBaseY + 35)
      .attr("class", "temp")
      .text(current_restaurant_2.name)
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
  }

  svg
    .append("circle")
    .attr("cx", chartXOffset)
    .attr("cy", legendBaseY + averageTitleY)
    .attr("r", 5)
    .attr("class", "temp")
    .style("fill", "darkblue");
  svg
    .append("text")
    .attr("x", 20 + chartXOffset)
    .attr("y", legendBaseY + averageTitleY + 5)
    .attr("class", "temp")
    .text("Salt Lake County Average")
    .style("font-size", "15px")
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
      name: "SALT LAKE CITY AVERAGE",
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
  let chartWidth = boxWidth - MARGIN.right;
  let chartHeight = boxHeight - MARGIN.bottom;

  /* Create X-Axis */
  // an array of the appropriate tick labels
  let tickLabels = ["SALT LAKE CITY AVERAGE"];
  for (let i = 0; i < restaurants.length; i++) {
    if (restaurants[i]) {
      tickLabels.push(restaurants[i].name);
    }
  }

  // domain is just the 2 aggregates we wanna show
  let xScale = d3
    .scalePoint()
    .domain(tickLabels)
    .range([MARGIN.left, chartWidth - MARGIN.right])
    .padding([0.7]);

  //draw the x-axis
  d3.select("#barChart-x-axis")
    .attr("transform", `translate(0, ${yoffset + chartHeight - MARGIN.bottom})`)
    .call(d3.axisBottom(xScale).tickFormat((d, i) => tickLabels[i]));

  /* Create Y-Axis */
  // determine domain for y-axis
  let y_scale_domain = [0, maxViolations];

  // create yscale
  let yScale = d3
    .scaleLinear()
    .domain(y_scale_domain)
    .range([chartHeight - MARGIN.bottom, MARGIN.top]);

  //draw y axis
  let yAxis = d3
    .select("#barChart-y-axis")
    .attr("transform", `translate(${MARGIN.left}, ${yoffset})`)
    .call(d3.axisLeft(yScale));

  /* Draw the Bars, Legend, and interactivity */
  // ref: https://d3-graph-gallery.com/graph/barplot_stacked_basicWide.html
  // colors to use for the bars and legend
  colors = [
    ["avgcrit", "#f1a340"],
    ["avgnoncrit", "#998ec3"],
  ];

  // delete all barchart temporary elements
  svg.select(".barChart-temp").remove();

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

  // create title
  let title = "Total Average Violations";
  // update the title
  d3.select("#barChart-title").remove();
  svg
    .append("text")
    .attr("id", "barChart-title")
    .attr("x", boxWidth / 2)
    .attr("y", yoffset)
    .attr("text-anchor", "middle")
    .attr("class", "temp")
    .style("font-size", "16px")
    .text(title);
}
