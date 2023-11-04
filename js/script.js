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

function tableIntegrationwithCharts(restaurants){
  console.log(restaurants);

  const rows = document.querySelectorAll("tr");

  if (rows.length === 0) {
    console.error("No rows found in the table. Ensure the table is populated before attaching event listeners.");
    return;
  }

  rows.forEach((row) => {
    row.addEventListener("click", function() {

      try {
        // get the restaurant name from the table row
          let restaurant_name = row.cells[0].innerText;
          // filter the restaurants by those that contain the search term
          current_restaurant = pd.filtered_by(
            restaurants,
            "nameContains",
            restaurant_name
          )[0];
          if (!current_restaurant) throw new Error(`Restaurant "${restaurant_name}" not found.`);
          drawAllGraphs();
      }
      catch (error) {
        console.error(error.message);
        // Optionally, display this error to the user in a user-friendly manner
      }
      
    });
  });
}

function defaultRestaurantSelection(restaurants){
  const rows = document.querySelectorAll("tr");
  const deafult_restaurant_name = rows[2].cells[0].innerText;
  current_restaurant = pd.filtered_by(
    restaurants,
    "nameContains",
    deafult_restaurant_name
  )[0];
  drawAllGraphs();
}

function applyFilterAndSort() {
  const filterBy = document.getElementById("filter-by").value;
  const sortBy = document.getElementById("sort-by").value;
  const filterValue = document.getElementById("filter-what").value;
  const sortAlphabetically = document.getElementById("filter-sort").checked;

  // filter the restaurants by the filterBy and filterValue

  let filteredRestaurants = restaurant_list;

  if((filterBy && filterBy!== " ") && filterValue){
    filteredRestaurants = pd.filtered_by(
      filteredRestaurants,
      filterBy,
      filterValue
    );
  }

  // sort the restaurants by the sortBy and sortAlphabetically

  if(sortAlphabetically){
    if(filterBy === "nameStartsWith" || filterBy === "nameContains"){
      filteredRestaurants = pd.sorted_by(
        filteredRestaurants,
        "name"
      );
    }else{
    filteredRestaurants = pd.sorted_by(
      filteredRestaurants,
      filterBy
    );
   }
 }
 else if(sortBy && sortBy!== " "){
  console.log("sort by", sortBy)
  filteredRestaurants = pd.sorted_by(
    filteredRestaurants,
    sortBy
  );
 }


// Destroy the existing DataTable instance
if ($.fn.dataTable.isDataTable('#example')) {
  $('#example').DataTable().destroy();
}
// Now recreate the table with the filtered and sorted restaurant list
createTable(filteredRestaurants);

// Update the table integration with charts and reselect the default restaurant
defaultRestaurantSelection(filteredRestaurants);
tableIntegrationwithCharts(filteredRestaurants);
 
}


// call fetchJSONFile
// this is the function executed as a callback when parsing is done
fetchJSONFile("data/data_with_towns.json", function (data) {
  // Create a new ProcessData object and get list of restaurants
  // pd is also called in drawAllGraphs() functions
  pd = new ProcessData(data);
  pd.process_data();
  restaurant_list = pd.restaurants;

  createTable(restaurant_list);

  // By deafult the drawAllgraphs() should show the first restaurant in the list
  defaultRestaurantSelection(restaurant_list);
  // Create an event listener for the menu's each restaurant element
  tableIntegrationwithCharts(restaurant_list);

  // Create an event listener for the menu's search elements
  document.getElementById("menu-submit-search")
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
       
        // redraw graphs now, to display them quickly for the user
        drawAllGraphs();
      }
    });

  // Attach event listeners to filter and sort elements
  document.getElementById("filter-by").addEventListener("change", function (){
    applyFilterAndSort();
  });
  document.getElementById("filter-what").addEventListener("input", function (){
    applyFilterAndSort();
  });
  document.getElementById("filter-sort").addEventListener("change", function (){
    applyFilterAndSort();
  });
  document.getElementById("sort-by").addEventListener("change", function (){
    applyFilterAndSort();
  });

  

  // initialize line graph:
  document.getElementById("lineGraphTypeSelection")
    .addEventListener("change", function () {
      drawLineGraph();
    });

  drawAllGraphs();
});
