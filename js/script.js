/**
* Requests the file and executes a callback with the parsed result once
* it is available
* @param {string} path - The path to the file.
* @param {function} callback - The callback function to execute once the result is available
*/
let restaurant_list;
function fetchJSONFile (path, callback) {
    const httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {

      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
          const data = JSON.parse(httpRequest.responseText);
          if (callback) callback(data);
        }
      }
    };
    httpRequest.open('GET', path);
    httpRequest.send();
  } 

function populateTable(data) {
  const table = d3.select('#restaurant-table tbody');
    
  data.forEach(function(restaurant) {
    const row = table.append('tr');
    row.append('td').text(restaurant.name);
    row.append('td').text(restaurant.address);
  });
}
  
  // call fetchJSONFile then build and render a tree
  // this is the function executed as a callback when parsing is done
fetchJSONFile('data/data_with_towns.json', function (data){
    const proccessData = new ProcessData(data);
    restaurant_list = proccessData.process_data();
    populateTable(restaurant_list);

});



