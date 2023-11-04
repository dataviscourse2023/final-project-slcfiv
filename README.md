# Salt Lake City Food Inspection Visualization (SLCFVIS) - Process Book

### Background and Motivation
We will be creating an interactive visualization of food inspection data from the Salt Lake County Health Department. This visualization will be helpful as it informs possible restaurant patrons about the overall cleanliness of whatever establishments they may be seeking to dine at. 
We have also found the information in these data humorous, in a sardonic way. For example, we saw a sushi burrito restaurant that received over 70 health code violations in the past four years. 
Additionally, one of our group members is particularly interested in urban geography, and this project has an urban geological component from the spatial context of the establishment locations. 
Furthermore, we determined that this dataset was accessible to us because the Salt Lake City Health Department provides thorough definitions for the attributes of these data.

### Project Objectives
The primary questions that we are trying to answer are as follows: 

Which local restaurants and restaurant chains in Salt Lake County are the cleanest and least clean? 
Which health code violations are the most and least common? How has restaurant compliance with the health code changed over time? 

We aim to provide a visualization to help potential restaurant patrons make informed decisions before they dine. The benefits to this are immediate: such a visualization will help customers make informed decisions about where to dine in terms of any restaurant's sanitation. 
Additionally, one can see whether a restaurant has improved or degraded in health code compliance over time. Finally, visualizing the data collected by the Salt Lake County Health Department makes this information more accessible to the public.


### Data Processing Notes
We first updated the original CSV that we were given to include the town of each restaurant since this was not included. Instead, the CSV had only the address initially. 

For most restaurants, this was a simple 2 step process.

1. First, we used an API offered by the Utah government, which allows you to send the address and county of a parcel, which will send you information about that parcel. Unfortunately, for Salt Lake County, the town was always listed as Salt Lake City. However, it also included the latitude and longitude, which we used in step 2.
2. We then used the OpenStreetMap reverse geocoding API. This API allows you to send a latitude and longitude, and it returns information about that point, including the town.

There were many addresses for which the above process did not work. Unfortunately, addresses on numbered roads (e.g., 1300 W) did not include the direction of the road. For example, 1300 E and 1300 W would be listed as 1300. Such cases created ambiguity for addresses, preventing us from looking them up with the above process. To get around this, we first wrote a script that uses geographically informed checks to identify which town an address is in (e.g., north of 2100 S is in Salt Lake City) or what the direction of the road is (e.g., there are no north roads south of 1300, so any address of the form XYZ E 1800 must be on 1800 S). These checks were able to mostly whittle down these ambiguous addresses, although some needed to be manually verified. Also, there were some restaurants whose towns needed to be manually identified for whatever reason.

The data includes health inspection reports of anywhere that serves food. Primarily, this includes restaurants, but it also includes schools, some grocery stores, prisons, retirement facilities, and other facilities. We decided to limit the visualization to establishments that anybody from the general public can attend. Thus, when doing this search, rows containing the following strings in their establishment name were skipped: “SCHOOL,” "CENTER," "CHILD," "LIVING," "CORRECTION," "ARAMARK," “HEALTH,” “CARE,” “JAIL,” “KIDS,” “ELEMENTARY,” “DETENTION,” “FOOD BANK,” “RECOVERY.” This is because businesses with these words in their names are almost certainly not public establishments that anybody can go to.

This CSV was then processed in our Jupyter Notebook using Pandas and NumPy. In our Jupyter Notebook, we use pandas to perform our data processing.

First, we handled data cleaning and derivation in these steps:
  1. Add columns defining a violation as a “Critical 1” or “Critical 2” item. Definitions for “Critical 1” and “Critical 2” are on page 4 of the Food Sanitation PDF.
  2. Remove the numerical identifiers on restaurants, e.g., Subway #12345. We inspected all the unique names that include the character “#.” We decided that each establishment is identifiable without it via its address. So, we removed the “#” and all characters following it from each name.
  3. Next, we deleted all rows that contained the strings used to identify non-public locations in the town search in order to limit our data to only locations that are publicly accessible.
  4. During our data cleaning, we realized it would be helpful to note when a restaurant received a violation under 7.4.4 Emergency Enforcement in its own column.
  5. We removed rows with the following violations for the corresponding reasons:
      a) "R392-510UICAA” violation code as this is regarding the Utah Clean Air Act, which is not mentioned in the Food Health Regulation PDF.
      b) “R392-100: 5-202.11*” violation code, which is not mentioned in the Food Health Regulation PDF.
      c) All violation codes begin with “0”, as these are not rules broken by the establishment but rather notifications for events such as “Cleaning Education Provided” or shadowing.
  6. We noticed that violations under 7.4.2 are Variances, which are not rule violations but rather allowances for modifications or waivers to establishments of specific rules. We decided to label such violations accordingly with a “Variance” column.
  7. After all this cleaning, we then removed asterisks from the violation codes.

Finally, we have converted the data we pre-processed as CSV into the JSON format. It helps to read data easily for creating the menu, tables of the restaurants, and all the necessary charts.

We are currently considering using Javascript and D3.JS to develop our web-based visualization. 

### Menu Creation
To get the data ready for the menu, we created a javascript file that iterates through all of the data and assigns it to a relevant class hierarchy. This hierarchy has three classes. The Restaurant class represents a single restaurant. Each restaurant has a collection of instances of the Inspection class. 
This Inspection class represents a single time a health inspector inspected that restaurant. Each Inspection contains a collection of instances of the Violation class. The Violation class represents a single violation found during a health inspection. Our MenuBar has several options such as ‘Filtered by,’ ‘Sort by,’ and ‘Search.’ 
We will eventually integrate these functionalities with the table that holds the names and addresses of the restaurants in a tabular format. Currently, only ‘Filter by’ works fine with the existing table.
We have created the table using jQuery and HTML in a  javascript file (table.js). For now, each row of the table contains the name and address of each restaurant. The rows of the table are clickable, and it updates the line chart and bar chart according to the selection of the restaurant by click. 
Note that our feature has only a single selection functionality.

### Line Graph Creation
To make the line graph, the first thing that needed to be accomplished was to calculate the average number of violations per inspection for Utah County for each year. This was not difficult to accomplish. After this, the line chart was made using standard procedures in D3. 
It was not initially clear how to plot the Utah County average each year as a single vertex on a line chart. This is because the rightmost endpoint of the x-axis of the line chart is the first day of the first year outside of the date range being represented. 
To that end, it did not make sense to put a data point there. We ultimately decided to place each data point at the midpoint of each calendar year, which it represented. 

### Bar Chart Creation
The bar chart involves creating two bars, one that shows average Salt Lake City violations and the other showing the violations of the user-selected restaurant. The Salt Lake City averages are precomputed on the JSON data. The total violations for a selected restaurant are obtained from our JSON data structures as well. 
The next step in creating the bar charts involves coloring the bars specifically based on the types of violations the restaurant / Salt Lake City average has. As of now, we have created the axes for our bar chart and still need to code up the bars being drawn accordingly. 


### Visualizing Code Violations
Initially, we had planned to visualize the code violations for the chosen/selected restaurant in a pie chart. While proceeding with the implementation, we printed the violation codes that occurred for random restaurants and found that, on average, they are usually 6/7 for each restaurant. 
Some codes occur twice or thrice, but mostly, they occur once within the total number of inspections they went through. Now, we are rethinking whether to visualize this with the pie chart because we are confused if it will make sense or not because, mostly, it will show occurrence 1 for most of the codes.  However, we are thinking about two alternatives over pie chart:
  1. Treemap / D3 | Observable, and 2. Bubble chart / D3 | Observable.
We will assess the pros and cons of three of the visualizations and will implement the appropriate one in the next iteration. 
