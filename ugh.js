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

// to use for timing out execution while window resizes
let timeOut;

const default_restaurant_name = "Red Iguana Restaurant";
const default_restaurant_name_2 = "Vessel Kitchen";

function drawAllGraphs() {
  drawLineGraph();
  drawBarChart();
  drawBubblechart();
}

// For selecting tabs in the menu
// ref: https://www.w3schools.com/howto/howto_js_tabs.asp
function openTab(evt, tabName) {
  // Hide all tab content
  let tabcontent = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Remove class "active" from all tablinks buttons
  tablinks = document.getElementsByClassName("tablinks");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace("active", "");
  }

  // Show the selected tab by adding the "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "table";
  evt.currentTarget.className += "active";

  // if we're opening the map tab, create the map
  if (tabName === "map-div") {
    map = createMap();
  }
}

// Create the map
function createMap() {
  /* This uses the Leaflet library and is done with their quick start tutorial*/
  // first delete any map currently drawn
  d3.select("#map").remove();
  // add the div first before running the code to create map, only do this once
  d3.select("#map-div")
    .append("div")
    .attr("id", "map")
    .attr("class", "leaflet-container");

  //ref: https://leafletjs.com/examples/quick-start/
  const map = L.map("map").setView([51.505, -0.09], 13);

  const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  return map;
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

function download(content, fileName) {
  var a = document.createElement("a");
  var file = new Blob([JSON.stringify(content, null, 2)], {
    type: "text/plain",
  });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

// call fetchJSONFile
// this is the function executed as a callback when parsing is done
fetchJSONFile("data/data_with_towns.json", function (data) {
  // for each restaurant, get the address and town to get coordinates
  let data_with_coords_and_towns = data;
  // add a new column called "Coordinates"
  data_with_coords_and_towns.columns[12] = "Coordinates";
  console.log("entering for loop");
  for (let i = 0; i < data.data.length; i++) {
    // grab address and zone of current restaurant
    let curr_addr = data_with_coords_and_towns.data[i][3];
    let curr_zone = data_with_coords_and_towns.data[i][4];
    let response;

    // create a new HTTP GET request to the corresponding URL
    Http = new XMLHttpRequest();
    const url = `https://api.mapserv.utah.gov/api/v1/geocode/${curr_addr}/${curr_zone}?apiKey=AGRC-Dev`;
    // console.log(
    //   `data_with_coords_and_towns.data[${i}] = ${data_with_coords_and_towns.data[i]}`
    // );
    // make the request and save the response
    Http.open("GET", url, true);
    Http.send();
    Http.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        response = JSON.parse(Http.response);
        // get the x y coordinates
        data_with_coords_and_towns.data[i][12] = [
          response.result.location.x,
          response.result.location.y,
        ];
      }
    };
  }
  console.log("exiting for loop");
  console.log(data_with_coords_and_towns);
  download(data_with_coords_and_towns, lmao.json);

  // download(data_with_coords_and_towns, "json.txt", "text/plain");
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

  // Open the search tab
  document.getElementById("defaultOpen").click();

  // Attach event listener to redraw all graphs on window resize
  window.addEventListener("resize", (event) => {
    clearTimeout(timeOut);
    timeOut = setTimeout(function () {
      drawAllGraphs();
    }, 50);
  });

  // initialize line graph:
  document
    .getElementById("lineGraphTypeSelection")
    .addEventListener("change", function () {
      drawLineGraph();
    });

  drawAllGraphs();
});
