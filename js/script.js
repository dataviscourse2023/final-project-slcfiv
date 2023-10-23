/**
 * Requests the file and executes a callback with the parsed result once
 * it is available
 * @param {string} path - The path to the file.
 * @param {function} callback - The callback function to execute once the result is available
 */

function fetchJSONFile(path, callback) {
  const httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        const data = JSON.parse(httpRequest.responseText);
        if (callback) callback(data);
      }
    }
  };
  httpRequest.open("GET", path);
  httpRequest.send();
}

// call fetchJSONFile then create ProcessData object to access globally
// setup visualization
var processData = fetchJSONFile("data/data_with_towns.json", function (data) {
  const proccessData = new ProcessData(data);
  proccessData.process_data();
  setup(proccessData);
});

function setup(processdata) {
  // add an event listener to all menu and selection elements
  // update processData object accordingly in the changeData function
  // ref: https://d3js.org/d3-selection/events
  // ref: https://www.tutorialsteacher.com/d3js/select-dom-element-using-d3js
  // ref: https://stackoverflow.com/questions/24193593/d3-how-to-change-dataset-based-on-drop-down-box-selection
  filterby_listener = d3
    .select("#filter-by")
    .on("change", (event) => update(processdata, "filter"));
  filterwhat_listener = d3
    .select("#filter-what")
    .on("change", (event) => update(processdata, "filter"));
  filtersort_listener = d3
    .select("#filter-sort")
    .on("change", (event) => update(processdata, "filter"));

  // update visualizations
  update(processdata, "none");
}

/**
 * Update the data according to document settings
 * Param:
 * data - the ProcessData object being used
 * change - a string indicating what change is to occur
 */
function update(processdata, change) {
  // to hold data to use (currently the processData object)
  curr_data = processdata;
  // call ProcessData function accordingly
  if (change === "filter") {
    // get filter parameters
    filterby = d3.select("#filter-by").node().value;
    filterwhat = d3.select("#filter-what").node().value;
    filtersort = d3.select("#filter-sort").node().value;
    if (filtersort === "on") {
      filtersort = true;
    } else {
      filtersort = false;
    }
    curr_data = processdata.filtered_by(
      processdata.restaurants,
      filterby,
      filterwhat,
      filtersort
    );
  }

  // update the charts and plots with the appropriate functions
  updateBarChart();
}

/**
 * Update the bar chart
 */

function updateBarChart() {
  console.log("inside updateBarChart()");
}
