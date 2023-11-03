/**
 * Requests the file and executes a callback with the parsed result once
 * it is available
 * @param {string} path - The path to the file.
 * @param {function} callback - The callback function to execute once the result is available
 */

let pd = null;
let current_restaurant = null;

function drawAllGraphs() {
  drawLineGraph();
  drawBarChart();
}

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

function tableIntegrationwithCharts(restaurantList){

  createTable(restaurantList);

  const rows = document.querySelectorAll("tr");
  rows.forEach((row) => {
    row.addEventListener("click", function() {
      // get the restaurant name from the table row
      let restaurant_name = row.cells[0].innerText;
      // filter the restaurants by those that contain the search term
      current_restaurant = pd.filtered_by(
        pd.restaurants,
        "nameContains",
        restaurant_name
      )[0];
      drawAllGraphs();
    });
  });
}

function deafultRestaurantSelection(){
  const rows = document.querySelectorAll("tr");
  const deafult_restaurant_name = rows[2].cells[0].innerText;
  current_restaurant = pd.filtered_by(
    pd.restaurants,
    "nameContains",
    deafult_restaurant_name
  )[0];
}

// call fetchJSONFile
// this is the function executed as a callback when parsing is done
fetchJSONFile("data/data_with_towns.json", function (data) {
  // Create a new ProcessData object and get list of restaurants
  // pd is also called in drawAllGraphs() functions
  pd = new ProcessData(data);
  pd.process_data();
  restaurant_list = pd.restaurants;

  // Create an event listener for the menu's search elements
  document
    .getElementById("menu-submit-search")
    .addEventListener("click", function () {
      // get submitted search term
      let restaurant_search_term =
        document.getElementById("menu-search-box").value;
      // filter the restaurants by those that contain the search term
      let restaurant_search_result = pd.filtered_by(
        pd.restaurants,
        "nameContains",
        restaurant_search_term
      )[0];
      // if no results are found, display messages
      if (!restaurant_search_result) {
        document.getElementById("menu-restaurant-warning").style.display =
          "block";
      }
      // otherwise, update the currently selected restaurant and update the menu accordingly
      else {
        document.getElementById("menu-restaurant-warning").style.display =
          "none";
        current_restaurant = restaurant_search_result;
        tabulate(restaurant_list, ["name", "address"]);

        // redraw graphs now, to display them quickly for the user
        drawAllGraphs();
      }
    });

  // Create an event listener for the menu's each restaurant element
  tableIntegrationwithCharts(restaurant_list);

  // By deafult the drawAllgraphs() should show the first restaurant in the list
  deafultRestaurantSelection();
  
  // initialize line graph:
  document
    .getElementById("lineGraphTypeSelection")
    .addEventListener("change", function () {
      drawLineGraph();
    });

  drawAllGraphs();
});
