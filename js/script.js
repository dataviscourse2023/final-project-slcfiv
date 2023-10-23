/**
* Requests the file and executes a callback with the parsed result once
* it is available
* @param {string} path - The path to the file.
* @param {function} callback - The callback function to execute once the result is available
*/

let pd = null
let current_restaurant = null

function drawAllGraphs(){
  drawLineGraph();
}

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
  
  // call fetchJSONFile then build and render a tree
  // this is the function executed as a callback when parsing is done
fetchJSONFile('data/data_with_towns.json', function (data){
    console.log("this  ran first")
    pd = new ProcessData(data);
    pd.process_data();

    current_restaurant = pd.filtered_by(pd.restaurants, "nameStartsWith", "CAJUN")[0]

    // initialize line graph:
    document.getElementById("lineGraphTypeSelection").addEventListener("change", function(){
      drawLineGraph()
    })

    // set button callback:
    document.getElementById("tempMenuButton").addEventListener("click", function(){
      let restaurant_search = document.getElementById("tempMenuTextbox").value
      let test_restaurant = pd.filtered_by(pd.restaurants, "nameContains", restaurant_search)[0]
      if(!test_restaurant){
        document.getElementById("tempMenuWarning").style.display = "block";
      }
      else{
        document.getElementById("tempMenuWarning").style.display = "none";
        current_restaurant = test_restaurant
        drawAllGraphs()
      }
    })

    drawAllGraphs();

});