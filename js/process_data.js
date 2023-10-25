// --------------- Useful functions ------------------------
// example usage:
// console.log(filtered_by(restaurants, "nameStartsWith", "A"))
// console.log(sorted_by(restaurants, "violations", false))

// Note: these examples won't work if you uncomment them because this will
// run before the data is processed! If you want to see these in action,
// put them at the bottom of the process_data function

// used for deriving data from things
let derivative_function = function (x) {
  return x;
};

class ProcessData {
  constructor(json) {
    this.restaurants = [];
    this.done_processing = false;
    this.data = json.data;

    // keys are years,
    // values are a list of
    // [ average violations per inspection, average critical violations per inspection, average noncritical violatiosn per inspection]
    this.averageViolationsPerInspectionPerYear = {};

    // list of
    // [average violations per inspection, average critical violations per inspection, average noncritical violations per inspection]
    this.averageViolationsPerInspection = [0, 0, 0];
  }

  process_data() {
    console.log("Processing data in function!");
    let first_row = this.data[0];
    let restaurant = new Restaurant(
      first_row[0],
      first_row[2],
      first_row[3],
      first_row[4]
    );
    let inspection = new Inspection(first_row[1]);

    // go through all of the data and put it into our lists
    for (let i = 0; i < this.data.length; i++) {
      let row = this.data[i];

      if (restaurant.id !== row[0]) {
        // check if we are done with the current restaurant

        // add the current inspection to the restaurant
        restaurant.add_inspection(inspection);

        // calculate the statistics of the previous restaurant and add to list
        restaurant.calculate_statistics();
        this.restaurants.push(restaurant);

        // make a new restaurant and inspection
        restaurant = new Restaurant(row[0], row[2], row[3], row[4]);
        inspection = new Inspection(row[1]);
      } else if (inspection.date !== row[1]) {
        // check if we are done with the current inspection

        restaurant.add_inspection(inspection);
        inspection = new Inspection(row[1]);
      }

      // add the current inspection
      let code = row[5];
      if (code !== "N/A") {
        let code_period = code.indexOf(".");
        inspection.add_violation(
          code.substring(0, code_period),
          code.substring(code_period + 1),
          row[7],
          row[8],
          row[9],
          row[10],
          row[11]
        );
      }
    }

    // add the rest of the data
    restaurant.add_inspection(inspection);
    restaurant.calculate_statistics();
    this.restaurants.push(restaurant);

    // calculate average violations per inspection
    let totalInspectionsPerYear = {};
    let totalInspections = 0;
    let years = [];
    for (let i = 0; i < this.restaurants.length; i++) {
      let restaurant = this.restaurants[i];
      for (let j = 0; j < restaurant.inspections.length; j++) {
        totalInspections++;
        let datestring = restaurant.inspections[j].date;
        let year = datestring.substring(datestring.length - 4);
        let violations = restaurant.inspections[j].total_violations();
        this.averageViolationsPerInspection[0] +=
          violations[0] + violations[1] + violations[2];
        this.averageViolationsPerInspection[1] += violations[1] + violations[2];
        this.averageViolationsPerInspection[2] += violations[0];
        if (year in totalInspectionsPerYear) {
          totalInspectionsPerYear[year] += 1;
          this.averageViolationsPerInspectionPerYear[year][0] +=
            violations[0] + violations[1] + violations[2];
          this.averageViolationsPerInspectionPerYear[year][1] +=
            violations[1] + violations[2];
          this.averageViolationsPerInspectionPerYear[year][2] += violations[0];
        } else {
          years.push(year);
          totalInspectionsPerYear[year] = 1;
          this.averageViolationsPerInspectionPerYear[year] = [
            violations[0] + violations[1] + violations[2],
            violations[1] + violations[2],
            violations[0],
          ];
        }
      }
    }

    for (let i = 0; i < years.length; i++) {
      this.averageViolationsPerInspectionPerYear[years[i]][0] /=
        totalInspectionsPerYear[years[i]];
      this.averageViolationsPerInspectionPerYear[years[i]][1] /=
        totalInspectionsPerYear[years[i]];
      this.averageViolationsPerInspectionPerYear[years[i]][2] /=
        totalInspectionsPerYear[years[i]];
    }

    this.averageViolationsPerInspection[0] /= totalInspections;
    this.averageViolationsPerInspection[1] /= totalInspections;
    this.averageViolationsPerInspection[2] /= totalInspections;

    console.log(this.averageViolationsPerInspectionPerYear);
    console.log(this.averageViolationsPerInspection);

    this.done_processing = true;
    console.log("Done processing data!");
    console.log(this.restaurants[0]);
  }

  /*
   * Overview: Input a list of functions and some search parameters. It will return a list
   *           filtered and (optionally) sorted based on the criteria. If you are searching
   *           if the string contains a certain character, the sorting will favor restaurants
   *           where that search term occurs earlier in the string. For example, if you are
   *           searching for restaurants whose names contain "A", the first things in the list
   *           will be restaurants whose name starts with "A", then has a second letter "A", etc.
   *           Note that the list that is returned is a copy of the list. The original is retained.
   *
   * Params:
   * restaurant_list: the list that you are filtering down
   * by: A string describing what you would like to filter by. Options are:
   *      - "address": does the address contain the given string
   *      - "nameStartsWith": does the restaurant name start with the given string
   *      - "nameContains": does the restaurant name contain the given string
   *      - "town": does the town name contain the given string
   * what: the string of the search query
   * sort: whether or not the data should also be sorted by the thing that you are searching by
   *
   */
  filtered_by(restaurant_list, by, what, sort = true) {
    let filter_function = null;
    switch (by) {
      case "address":
        filter_function = (x) => x.address;
        break;
      case "nameStartsWith":
      case "nameContains":
        filter_function = (x) => x.name;
        break;
      case "town":
        filter_function = (x) => x.town;
        break;
    }
    if (by === "nameStartsWith") {
      restaurant_list = restaurant_list.filter(
        (x) => filter_function(x).indexOf(what) == 0
      );
      derivative_function = filter_function;
      if (sort) {
        restaurant_list.sort(this.derivative_compare);
      }
    } else {
      restaurant_list = restaurant_list.filter(
        (x) => filter_function(x).indexOf(what) != -1
      );

      if (sort) {
        // sort globally by what we are filtering by
        derivative_function = filter_function;
        restaurant_list.sort(this.derivative_compare);

        // sort so that things that match the search term earlier are earlier in the list
        derivative_function = (x) => filter_function(x).indexOf(what);
        restaurant_list.sort(this.derivative_compare);
      }
    }
    return restaurant_list;
  }

  /*
   * Overview: Input a list of restaurants and returns that list sorted by
   *           desired criteria. Note: creates a copy of the data that you
   *           are sorting, so the original data is retained.
   *
   * Params:
   * restaurant_list: the list that you are filtering down
   * by: A string describing what are you sorting by. Options are:
   *      - "address": alphabetical ordering of the address of the restaurant
   *      - "critical": number of critical violations
   *      - "id": the establishment id of the restaurant
   *      - "name": alphabetical order of the name
   *      - "noncritical": the average number of non-critical violations per inspection
   *      - "town": alphabetical order of the town
   *      - "violations": the average number of violations per inspection
   */
  sorted_by(restaurant_list, by, ascending = true) {
    restaurant_list = [...restaurant_list]; // clone the restaurant list
    switch (by) {
      case "address":
        derivative_function = (x) => x.address;
        break;
      case "critical":
        derivative_function = (x) =>
          x.average_violations[1] + x.average_violations[2];
        break;
      case "id":
        derivative_function = (x) => x.id;
        break;
      case "name":
        derivative_function = (x) => x.name;
        break;
      case "noncritical":
        derivative_function = (x) => x.average_violations[0];
        break;
      case "town":
        derivative_function = (x) => x.town;
        break;
      case "violations":
        derivative_function = (x) =>
          x.average_violations[0] +
          x.average_violations[1] +
          x.average_violations[2];
        break;
    }

    if (ascending) {
      restaurant_list.sort(this.derivative_compare);
    } else {
      restaurant_list.sort(this.reverse_derivative_compare);
    }
    return restaurant_list;
  }

  // ---------------------- HELPER FUNCTIONS ---------------------------

  // a function that allows us compare functions by derived values
  // the derived value that we are comparing by is stored in the function
  // derivative_function
  derivative_compare(x, y) {
    let val1 = derivative_function(x);
    let val2 = derivative_function(y);
    if (val1 < val2) {
      return -1;
    }
    if (val1 > val2) {
      return 1;
    }
    return 0;
  }

  // allows us to sort by derivative compare,
  // but in reverse
  reverse_derivative_compare(x, y) {
    let val1 = derivative_function(x);
    let val2 = derivative_function(y);
    if (val1 < val2) {
      return 1;
    }
    if (val1 > val2) {
      return -1;
    }
    return 0;
  }
}
