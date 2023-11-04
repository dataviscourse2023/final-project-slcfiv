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
