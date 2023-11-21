/**
 * Requests the file and executes a callback with the parsed result once
 * it is available
 * @param {string} path - The path to the file.
 * @param {function} callback - The callback function to execute once the result is available
 */

let pd = null;
let current_restaurant = null;
let current_restaurant_2 = null;

let require_password = false;

const default_restaurant_name = "Red Iguana Restaurant";
const default_restaurant_name_2 = "Vessel Kitchen";

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

function tableIntegrationwithCharts(restaurants) {
  const rows = document.querySelectorAll("tr");

  if (rows.length === 0) {
    console.error(
      "No rows found in the table. Ensure the table is populated before attaching event listeners."
    );
    return;
  }

  rows.forEach((row) => {
    row.addEventListener("click", function () {
      try {
        // get the restaurant name from the table row
        let restaurant_name = row.cells[0].innerText;
        let address = row.cells[1].innerText;
        let updateRestaurant = null;
        // filter the restaurants by those that contain the search term
        updateRestaurant = pd.filtered_by(
          restaurants,
          "nameContains",
          restaurant_name
        );

        updateRestaurant = pd.filtered_by(updateRestaurant, "address", address);

        if (selectionMode == 1) {
          current_restaurant = updateRestaurant[0];
        } else {
          current_restaurant_2 = updateRestaurant[0];
        }
        if (!current_restaurant)
          throw new Error(`Restaurant "${restaurant_name}" not found.`);
        document.getElementById("multiselection-title").innerHTML =
          updateRestaurant[0].name;
        drawAllGraphs();
      } catch (error) {
        console.error(error.message);
        // Optionally, display this error to the user in a user-friendly manner
      }
    });
  });
}

// checks the password that the user identified at the beginning
function checkPassword() {
  const passwordCheck = document.getElementById("password-entry").value;
  if (passwordCheck == "Rosen") {
    document.getElementById("password").style.display = "none";
  } else {
    document.getElementById("password-entry").value = "";
    document.getElementById("password-incorrect").style.display = "inline";
  }
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

  // Attach event listeners to filter and sort elements
  document.getElementById("filter-by").addEventListener("change", function () {
    applyFilterAndSort();
  });
  document.getElementById("filter-what").addEventListener("input", function () {
    applyFilterAndSort();
  });
  document.getElementById("sort-by").addEventListener("change", function () {
    applyFilterAndSort();
  });
  document.getElementById("ascending").addEventListener("change", function () {
    applyFilterAndSort();
  });
  document
    .getElementById("multiselection-button-1")
    .addEventListener("click", function () {
      multiselectionButton(1);
    });
  document
    .getElementById("multiselection-button-2")
    .addEventListener("click", function () {
      multiselectionButton(2);
    });
  document
    .getElementById("multiselection-clear")
    .addEventListener("click", function () {
      multiselectionClear();
    });
  if (require_password) {
    document
      .getElementById("password-confirm")
      .addEventListener("click", function () {
        checkPassword();
      });
  } else {
    document.getElementById("password").style.display = "none";
  }

  // Attach event listener to redraw all graphs on window resize
  window.addEventListener("resize", (event) => {
    drawAllGraphs();
  });

  // initialize line graph:
  document
    .getElementById("lineGraphTypeSelection")
    .addEventListener("change", function () {
      drawLineGraph();
    });

  drawAllGraphs();
});
