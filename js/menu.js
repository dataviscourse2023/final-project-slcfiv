let selectionMode = 1 // either selecting restaurant 1 or restaurant 2

function defaultRestaurantSelection(restaurants){
    current_restaurant = pd.filtered_by(
      restaurants,
      "nameStartsWith",
      default_restaurant_name
    )[0];
    current_restaurant_2 = null
  
    const sortBy = document.getElementById("sort-by").value;
    const ascendingText = document.getElementById("ascending").value
  
    // update the ascending/descending values depending on what type of filter is selected
    // this needs to go here to make sure that the labels update properly when the page is
    // refreshed
    if( sortBy === "name" || sortBy === "address" || sortBy === "town"){
      document.getElementById("ascending-option-1").innerHTML = "A-Z"
      document.getElementById("ascending-option-2").innerHTML = "Z-A"
    }
    else{
      document.getElementById("ascending-option-1").innerHTML = "most - least"
      document.getElementById("ascending-option-2").innerHTML = "least - most"
    }

    // make sure that the multiselection buttons are correctly labeled.
    // again, this is here particularly in the event of a refresh.
    selectionMode = -1
    multiselectionButton(1);

    drawAllGraphs();
}

// Update the table in the menu
// ref: https://stackoverflow.com/questions/15164655/generate-html-table-from-2d-javascript-array
function createTable(dataObj) {
    // select the table body in index.html
    // ref: https://stackoverflow.com/questions/43612014/how-to-get-values-of-tbody-element-from-the-table-using-the-table-id-and-without
    var tableBody = document.getElementsByTagName("tbody")[0];
  
    // Check if DataTable already exists
    var tableElement = $('#example');
    var existingTable = $.fn.dataTable.isDataTable(tableElement);
    if (existingTable) {
      // Destroy the existing DataTable before re-creating new rows
      tableElement.DataTable().destroy();
      // Clear the table body to ensure new data does not stack on old data
      // $('#example tbody').empty();
    }
  
    tableElement.find('tbody').empty();
  
  
    // for each Restaurant in data
    dataObj.forEach(function (data, index) {
      // create a new row object
      var row = document.createElement("tr");
  
      // create new cells to hold Restaurant attributes
      var name_cell = document.createElement("td");
      var addr_cell = document.createElement("td");
      var town_cell = document.createElement("td");
  
      // append attributes to cell objects accordingly
      name_cell.appendChild(document.createTextNode(data["name"]));
      addr_cell.appendChild(document.createTextNode(data["address"]));
      town_cell.appendChild(document.createTextNode(data["town"]));
  
      // append the cells to the created row object
      row.appendChild(name_cell);
      row.appendChild(addr_cell);
      row.appendChild(town_cell);
  
      // append the row to the table body
      tableBody.appendChild(row);
    });
  
    var table = tableElement.DataTable({
      aaSorting: [],
      paging: false,
      scrollCollapse: true,
      scrollY: "50vh",
      searching: false    
    });
  
    // create column filters
    table
      .columns()
      .flatten()
      .each(function (colIdx) {
        // Create the select list and search operation
        var select = $("<select />")
          .appendTo(table.column(colIdx).footer())
          .on("change", function () {
            table.column(colIdx).search($(this).val()).draw();
          });
  
        // Get the search data for the first column and add to the select list
        table
          .column(colIdx)
          .cache("search")
          .sort()
          .unique()
          .each(function (d) {
            select.append($('<option value="' + d + '">' + d + "</option>"));
          });
      });
}

function multiselectionButton(mode){
    if(mode != selectionMode){

        // nonMode will store the other selection mode
        let nonMode = 1
        if(mode == 1){
            nonMode = 2
        }

        document.getElementById("multiselection-button-" + mode.toString()).classList.add("button-primary");
        document.getElementById("multiselection-button-" + nonMode.toString()).classList.remove("button-primary");

        restaurant_name = ""
        if(mode == 1){
            document.getElementById("multiselection-clear").style.display = "none"
            restaurant_name = current_restaurant.name
        }
        else{
            document.getElementById("multiselection-clear").style.display = "inline"
            if(current_restaurant_2){
                restaurant_name = current_restaurant_2.name
            }
            else{
                restaurant_name = "No second restaurant selected"
            }
        }

        document.getElementById("multiselection-title").innerHTML = restaurant_name

        selectionMode = mode;
    }
}

function multiselectionClear(){
    current_restaurant_2 = null;
    document.getElementById("multiselection-title").innerHTML = "No second restaurant selected"
    drawAllGraphs()
}