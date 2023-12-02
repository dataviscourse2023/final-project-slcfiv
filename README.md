# Salt Lake City Food Inspection Visualization (SLCFVIS)

The following is an overview of our final submission.

## Folders and files
These are short descriptions of all the folders and files in our submission.
---------
<pre>
./                              - Top directory.
./README.md                     - This readme file.
./index.html                    - The HTML file we created
./SLCFIV Project Proposal.pdf   - Our original project proposal
|css/                           - All the stylesheets used in our project that work offline. All stylesheets used are in index.html
    |--- datatables.css         - The stylesheet required for using the [DataTables](https://datatables.net/) library
    |--- leaflet.css            - The stylesheet required for using the [Leaflet](https://leafletjs.com/) library
    |--- skeleton.css           - The stylesheet used for stylizing our HTML elements obtained from [Dave Gamache](https://github.com/dhg/Skeleton)
    |--- leaflet.css/           - The stylesheet required for using the [Leaflet](https://leafletjs.com/) library
|data/                          - The data we use within the project, already processed
    |--- data_with_towns_and_coords.json - The data we processed with town and coordinates added. This is the final one used.
    |--- data_with_towns.json   - The data we processed with towns added
|data_processing/               - Contains the raw data and scripts we used to process them
    |--- 2019-Present.csv       - The original data we received from Salt Lake County Health Department
    |--- data-cleaning.ipynb    - The Jupyter notebook where we did all data cleaning except adding towns and coordinates
    |--- getcoords.py           - Our first attempt at getting establishment coordinate data
    |--- raw-data.csv           - A pre-processing version of 2019-Present.csv
|js/                            - All of the JavaScript implementation and JavaScript libraries we used (that can run offline)
    |--- d3.v7.js               - A copy of the (D3)[https://d3js.org/] version 7 library
    |--- Inspection.js          - Definition of the 'Inspection' class
    |--- jquery-3.7.0.js        - A copy of the (JQuery)[https://jquery.com/] 3.7.0 library
    |--- jquery.dataTables.min.js  - A copy of the [DataTables](https://datatables.net/) library
    |--- leaflet.js             - A copy of the [Leaflet](https://leafletjs.com/) library
    |--- menu.js                - Implementation of our menu's logic, and our calls to DataTables library
    |--- process_data.js        - A run once script processing the data_with_towns_and_coords.json file to prepare for visualization
    |--- Restaurant.js          - Definition of the 'Restaurant' class
    |--- script.js              - Primary script for connecting all the libraries and other scripts we wrote
    |--- updateCharts.js        - Implementation for all our visualizations, the line chart, bar chart, and bubble chart
    |--- Violation.js           - Definition of the 'Violation' class
</pre>

## Attributions
Our project uses the following libraries and tools:
- [Leaflet](https://leafletjs.com/)
- [DataTables](https://datatables.net/)
- [Skeleton stylesheet by Dave Gamache](https://github.com/dhg/Skeleton)
- [D3](https://d3js.org/)
- [JQuery](https://jquery.com/)
- [Pandas](https://pandas.pydata.org/)
- [NumPy](https://numpy.org/doc/stable/index.html)
- [UGRC Web API Explorer](https://api.mapserv.utah.gov/)