// chart offset variables:
let lineChartX = 50;
let lineChartY = 50;
let barChartX = lineChartX + 50;
let barChartY = lineChartY;

// Constants for the charts, that would be useful.
const CHART_WIDTH = 500;
const CHART_HEIGHT = 250;
const MARGIN = { left: 50, bottom: 20, top: 20, right: 20 };
const ANIMATION_DUATION = 300;

// mode 0: all violations
// mode 1: non critical violations
// mode 2: critical violations
function drawLineGraph() {
  let mode = parseInt(document.getElementById("lineGraphTypeSelection").value);

  let svg = d3.select("#lineGraph").select("svg");

  // clean up elements from the previous line graph
  svg.selectAll(".temp").remove();

  // the data that will be applied for each restaurant
  let restaurant_data = [];
  // the max value for the y axis
  let max_y_axis_value = -1;
  let value = -1;
  let min_year = 3000;
  let max_year = 0;
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
  console.log(tickValues);

  let xscale = d3
    .scaleTime()
    .domain([
      new Date(years[0].toString() + "-01-01"),
      new Date((years[years.length - 1] + 1).toString() + "-01-01"),
    ])
    .range([0, 400]);
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
        lineChartX.toString() +
        "," +
        (330 + lineChartY).toString() +
        ")"
    )
    .call(xAxis);

  let yscale = d3.scaleLinear().domain(y_scale_domain).range([300, 0]);
  let yAxis = d3.axisLeft().scale(yscale);
  svg
    .select(".v")
    .attr(
      "transform",
      "translate(" +
        lineChartX.toString() +
        "," +
        (lineChartY + 30).toString() +
        ")"
    )
    .call(yAxis);

  let lineFunction = d3
    .line()
    .x((d) => xscale(d[0]) + lineChartX)
    .y((d) => yscale(d[1]) + lineChartY + 30);

  svg
    .select("#restaurantLine")
    .datum(restaurant_data)
    .attr("d", (d) => lineFunction(d))
    .attr("fill", "none")
    .attr("stroke", "green")
    .attr("stroke-width", "3px");

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
    .attr("x", lineChartX + 230)
    .attr("y", lineChartY)
    .attr("text-anchor", "middle")
    .attr("class", "temp")
    .style("font-size", "16px")
    .text(title);

  // do the tooltip hovering
  // based on this article: https://medium.com/@kj_schmidt/show-data-on-mouse-over-with-d3-js-3bf598ff8fc2

  // define the tooltip element
  let tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "temp")
    .attr("id", "lineGraphTooltip")
    .style("opacity", 0);

  // add vertices to each line:
  svg
    .select("#restaurantVertices")
    .selectAll("circle")
    .data(restaurant_data)
    .enter()
    .append("circle")
    .attr("class", "temp")
    .attr("cx", (d) => xscale(d[0]) + lineChartX)
    .attr("cy", (d) => yscale(d[1]) + lineChartY + 30)
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

  svg
    .select("#averageVertices")
    .selectAll("circle")
    .data(averages_data)
    .enter()
    .append("circle")
    .attr("class", "temp")
    .attr("cx", (d) => xscale(d[0]) + lineChartX)
    .attr("cy", (d) => yscale(d[1]) + lineChartY + 30)
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
  svg
    .append("circle")
    .attr("cx", lineChartX)
    .attr("cy", 370 + lineChartY)
    .attr("r", 5)
    .attr("class", "temp")
    .style("fill", "darkgreen");
  svg
    .append("text")
    .attr("x", 20 + lineChartX)
    .attr("y", 375 + lineChartY)
    .attr("class", "temp")
    .text(current_restaurant.name)
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
  svg
    .append("circle")
    .attr("cx", lineChartX)
    .attr("cy", 400 + lineChartY)
    .attr("r", 5)
    .attr("class", "temp")
    .style("fill", "darkblue");
  svg
    .append("text")
    .attr("x", 20 + lineChartX)
    .attr("y", 405 + lineChartY)
    .attr("class", "temp")
    .text("Salt Lake County Average")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
}

function drawBarChart() {
  // select the svg under the barChart div
  let svg = d3.select("#barChart").select("svg");

  // clean up elements from the previous line graph
  svg.selectAll(".temp").remove();

  // to store total violations of selected restaurant
  let value = 0;
  // look at all of restaurant's inspections
  for (let i = 0; i < current_restaurant.inspections.length; i++) {
    // get violation array, sum values in array
    total_violations = current_restaurant.inspections[i].total_violations();
    value = total_violations[0] + total_violations[1] + total_violations[2];
  }

  // get the average number of non-critical, critical 1, and critical 2 violations
  avg_value =
    pd.averageViolationsPerInspection[0] +
    pd.averageViolationsPerInspection[1] +
    pd.averageViolationsPerInspection[2];

  // determine domain for y-axis
  let y_scale_domain = [0, d3.max([value, avg_value])];
  console.log("d3.max([value, avg_value]) = ", d3.max([value, avg_value]));

  // domain is just the 2 aggregates we wanna show
  let xScale = d3
    .scalePoint()
    .domain([0, 1])
    .range([MARGIN.left, CHART_WIDTH - MARGIN.right]);

  // an array of the appropriate tick labels
  let tickLabels = ["SALT LAKE CITY AVERAGE", current_restaurant.name];

  // create xAxis for bar chart
  let xAxis = d3
    .axisBottom(xScale)
    .ticks(2)
    .tickFormat((d, i) => tickLabels[i]);

  // create yscale and yaxis for barchart
  let yScale = d3.scaleLinear().domain(y_scale_domain).range([300, 0]);
  let yAxis = d3.axisLeft().scale(yScale);

  // create title
  let title = "Total Average Violations";

  // update svg with axes
  g = svg.select("#barChart-g");
  // Create g element to hold x axis
  g.append("g")
    .attr("id", "bar-xAxis")
    .attr("transform", `translate(0,${300 - MARGIN.bottom})`);

  // Create g element for y Axis
  g.append("g")
    .attr("id", "bar-yAxis")
    .attr("transform", "translate(30,0)")
    .attr("transform", `translate(${MARGIN.left},0)`);

  // draw axes in appropriate g elements
  d3.select("#bar-xAxis").call(xAxis);
  d3.select("#bar-yAxis").call(yAxis);

  //   // update svg with axes, bars, and title
  //   g.selectAll("rect")
  //     .data(data)
  //     .join("rect")
  //     .attr("id", "bar")
  //     .attr("x", (d) => xScale(d.date))
  //     .attr("y", (d) => yScale(d[metric]))
  //     .attr("height", (d) => yScale(0) - yScale(d[metric]))
  //     .attr("width", xScale.bandwidth());

  // add the title
  svg
    .append("text")
    .attr("x", CHART_WIDTH / 2)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .attr("class", "temp")
    .style("font-size", "16px")
    .text(title);
}
