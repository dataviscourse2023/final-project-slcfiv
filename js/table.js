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
    var id_cell = document.createElement("td");
    var name_cell = document.createElement("td");
    var addr_cell = document.createElement("td");
    var town_cell = document.createElement("td");
    var noncrit_cell = document.createElement("td");
    var crit1_cell = document.createElement("td");
    var crit2_cell = document.createElement("td");

    // append attributes to cell objects accordingly
    id_cell.appendChild(document.createTextNode(data["id"]));
    name_cell.appendChild(document.createTextNode(data["name"]));
    addr_cell.appendChild(document.createTextNode(data["address"]));
    town_cell.appendChild(document.createTextNode(data["town"]));
    noncrit_cell.appendChild(document.createTextNode(data["inspections"][0]));
    crit1_cell.appendChild(document.createTextNode(data["inspections"][1]));
    crit2_cell.appendChild(document.createTextNode(data["inspections"][2]));

    // append the cells to the created row object
    row.appendChild(name_cell);
    row.appendChild(addr_cell);

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
