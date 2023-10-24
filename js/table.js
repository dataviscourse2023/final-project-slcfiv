
// function to create the table
function tabulate(data, columns) {
    
    var table = d3.select('.table-container').append('table').attr("class", "restaurant-table");
    // var table = d3.select('body').append('table').attr("class", "restaurant-table");
	var thead = table.append('thead');
	var	tbody = table.append('tbody');

	// append the header row
	thead.append('tr')
	  .selectAll('th')
	  .data(columns).enter()
	  .append('th')
	    .text(function (column) { 
            return column.charAt(0).toUpperCase() + column.slice(1);  
        });

	// create a row for each object in the data
	var rows = tbody.selectAll('tr')
	  .data(data)
	  .enter()
	  .append('tr');

	// create a cell in each row for each column
	var cells = rows.selectAll('td')
	  .data(function (row) {
	    return columns.map(function (column) {
	      return {column: column, value: row[column]};
	    });
	  })
	  .enter()
	  .append('td')
	    .text(function (d) { return d.value; });

    // set the height of the table body div to the desired height and set its overflow-y property to scroll
    // const tableBody = d3.select('.table-container').select('tbody');
    // tableBody.style('height', '250px');
    // tableBody.style('overflow-y', 'scroll');

    // // set the height of the table header div to the height of the table header and set its position property to sticky
    // const tableHeader = d3.select('.table-container').select('thead');
    // tableHeader.style('height', '30px');
    // tableHeader.style('position', 'sticky');
    // tableHeader.style('top', '0');

    const tableBody = d3.select('.table-container').select('tbody');
    const tableHeader = d3.select('.table-container').select('thead');
    const padding = 20; // adjust this value to match your padding
    const height = parseInt(d3.select('.table-container').style('height')) - parseInt(tableHeader.style('height')) - padding;
    tableBody.style('height', height + 'px');
    tableBody.style('overflow-y', 'scroll');

    // set the height of the table header div to the height of the table header and set its position property to sticky
    tableHeader.style('position', 'sticky');
    tableHeader.style('top', '0');

    return table;

  }