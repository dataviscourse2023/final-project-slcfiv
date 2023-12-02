/**
 * Requests the file and executes a callback with the parsed result once
 * it is available
 * @param {string} path - The path to the file.
 * @param {function} callback - The callback function to execute once the result is available
 */

let pd = null;
let current_restaurant = null;
let current_restaurant_2 = null;

let require_password = true;

// used for leaflet
let map = null;
let restaurantMarkers = {};

// to use for timing out execution while window resizes
let timeOut;

const default_restaurant_name = "Red Iguana Restaurant";
const default_restaurant_name_2 = "Vessel Kitchen";

function drawAllGraphs() {
  drawLineGraph();
  drawBarChart();
  drawBubblechart();
}

// // For selecting tabs in the menu
// // ref: https://www.w3schools.com/howto/howto_js_tabs.asp
// function openTab(evt, tabName) {
//   // Hide all tab content
//   let tabcontent = document.getElementsByClassName("tabcontent");
//   for (let i = 0; i < tabcontent.length; i++) {
//     tabcontent[i].style.display = "none";
//   }

//   // Remove class "active" from all tablinks buttons
//   tablinks = document.getElementsByClassName("tablinks");
//   for (let i = 0; i < tablinks.length; i++) {
//     tablinks[i].className = tablinks[i].className.replace("active", "");
//   }

//   // Show the selected tab by adding the "active" class to the button that opened the tab
//   document.getElementById(tabName).style.display = "table";
//   evt.currentTarget.className += "active";

//   // if we're opening menu, create the map
//   if (tabName === "map-div") {
//     map = createMap();
//   }
// }

function swapInMapView(viewMap) {
  if (viewMap) {
    document.getElementById("menu-search").style.display = "none";
    document.getElementById("menuOptions_wrapper").style.display = "none";
    document.getElementById("map-wrapper").style.display = "block";
    map.invalidateSize();
  } else {
    document.getElementById("menu-search").style.display = "block";
    document.getElementById("menuOptions_wrapper").style.display = "block";
    document.getElementById("map-wrapper").style.display = "none";
  }
}

// Create the map
function createMap() {
  // ref: https://leafletjs.com/2012/08/20/guest-post-markerclusterer-0-1-released.html
  let markers = new L.MarkerClusterGroup();

  /* This uses the Leaflet library and is done with their quick start tutorial*/
  // first delete any map currently drawn
  d3.select("#map").remove();
  // add the div first before running the code to create map, only do this once
  d3.select("#map-wrapper")
    .append("div")
    .attr("id", "map")
    .attr("class", "leaflet-container");

  //ref: https://leafletjs.com/examples/quick-start/
  map = L.map("map").setView([40.772422972586696, -111.91244602324893], 13);

  const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(tmpmap);

  // // add restaurant markers
  // let tooltip = d3.select("#tooltip")

  for (let i = 0; i < restaurant_list.length; i++) {
    layers = {};
    towns = [];

    // console.log(L.MarkerClusterGroup());

    if (
      restaurant_list[i].coords != [0, 0] &&
      !(
        restaurant_list[i].coords[0] < 40.78342 &&
        restaurant_list[i].coords[0] > 40.76925 &&
        ((restaurant_list[i].coords[1] > -111.87824 &&
          restaurant_list[i].coords[1] < -111.8692) ||
          (restaurant_list[i].coords[1] > -111.87432 &&
            restaurant_list[i].coords[1] < -111.8491) ||
          (restaurant_list[i].coords[1] > -111.85719 &&
            restaurant_list[i].coords[1] < -111.85615))
      )
    ) {
      let marker = L.marker(restaurant_list[i].coords)
        .bindPopup(restaurant_list[i].name)
        .on("mouseover", function () {
          this.openPopup();
        })
        .on("mouseout", function () {
          this.closePopup();
        })
        .on("click", function () {
          if (selectionMode == 1) {
            current_restaurant = restaurant_list[i];
            document.getElementById("multiselection-title").innerHTML =
              current_restaurant.name;
          } else {
            current_restaurant_2 = restaurant_list[i];
            document.getElementById("multiselection-title").innerHTML =
              current_restaurant_2.name;
          }
          drawAllGraphs();
        });
      restaurantMarkers[restaurant_list[i].coords] = marker;
      markers.addLayer(marker);
    }
  }
  map.addLayer(markers);
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
fetchJSONFile("data/data_with_towns_and_coords.json", function (data) {
  // console.log(data);
  // Create a new ProcessData object and get list of restaurants
  // pd is also called in drawAllGraphs() functions
  pd = new ProcessData(data);
  pd.process_data();
  restaurant_list = pd.restaurants;
  console.log(restaurant_list);

  createTable(restaurant_list);

  // By deafult the drawAllgraphs() should show the first restaurant in the list
  defaultRestaurantSelection(restaurant_list);
  // Create an event listener for the menu's each restaurant element
  tableIntegrationwithCharts(restaurant_list);

  // Attach event listeners to filter and sort elements
  document.getElementById("filter-by").addEventListener("change", function () {
    applyFilterAndSort();
  });
  document
    .getElementById("filter-submit")
    .addEventListener("click", function () {
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
  createMap();
});
