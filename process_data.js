// ---------------- Useful variables ----------------------

// set the path to data here:
let path_to_data = "./data_with_towns.json"

// a list of all restaurants. Each element in the last has type restaurant (see the restaurant class)
let restaurants = []

// will be set to true when the data is processed. Before then, it is not advised that you use the data.
let done_processing = false;

// --------------- Useful functions ------------------------

// example usage:

// console.log(filtered_by(restaurants, "nameStartsWith", "A"))
// console.log(sorted_by(restaurants, "violations", false))

// Note: these examples won't work if you uncomment them because this will
// run before the data is processed! If you want to see these in action,
// put them at the bottom of the process_data function


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
function filtered_by(restaurant_list, by, what, sort=true ){
    let filter_function = null
    switch(by){
        case "address":
            filter_function = (x) => x.address
            break
        case "nameStartsWith":
        case "nameContains":
            filter_function = (x) => x.name
            break
        case "town":
            filter_function = (x) => x.town
            break
    }
    if( by === "nameStartsWith" ){
        restaurant_list = restaurant_list.filter( (x) => filter_function(x).indexOf(what) == 0 )
        derivative_function = filter_function
        if( sort ){
            restaurant_list.sort( derivative_compare )
        }
    }
    else{        
        restaurant_list = restaurant_list.filter( (x) => filter_function(x).indexOf(what) != -1 )

        if( sort ){
            // sort globally by what we are filtering by
            derivative_function = filter_function
            restaurant_list.sort( derivative_compare )

            // sort so that things that match the search term earlier are earlier in the list
            derivative_function = (x) => filter_function(x).indexOf(what)            
            restaurant_list.sort( derivative_compare )
        }
    }
    return restaurant_list
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
function sorted_by(restaurant_list, by, ascending=true){
    restaurant_list = [...restaurant_list] // clone the restaurant list    
    switch(by){
        case "address":
            derivative_function = (x) => x.address
            break
        case "critical":
            derivative_function = (x) => x.average_violations[1] + x.average_violations[2]
            break
        case "id":
            derivative_function = (x) => x.id
            break
        case "name":
            derivative_function = (x) => x.name
            break
        case "noncritical":
            derivative_function = (x) => x.average_violations[0]
            break
        case "town":
            derivative_function = (x) => x.town;
            break
        case "violations":
            derivative_function = (x) => x.average_violations[0] + x.average_violations[1] + x.average_violations[2]
            break
    }

    if(ascending){
        restaurant_list.sort( derivative_compare )
    }
    else{
        restaurant_list.sort( reverse_derivative_compare )
    }
    return restaurant_list
}

// --------------------------- CLASSES ---------------------------------------

// Represents a restaurant and stores all of the inspections of the restaurant
class Restaurant{

    // parameters are direct from the spreadsheet. All are strings.
    constructor(id, name, address, town){
        this.id = id
        this.name = name.toUpperCase()
        this.address = address
        this.town = town.toUpperCase()
        // array holding objects of type inspection. Must be added with add_inspection.
        this.inspections = []
        // will have length 3. First entry is average non-critical, then average critical 1, then average critical 2.
        // Note: Average is the average amount per visit.
        // if all entries are -1 it means that the statistics have not yet been calculated.
        this.average_violations = [-1, -1, -1]
    }

    // parameter i is an object of type inspection.
    add_inspection(i){
        this.inspections.push(i)
    }

    calculate_statistics(){
        this.average_violations = [0,0,0]
        for(let i = 0; i < this.inspections.length; i++){
            let inspection_violations = this.inspections[i].total_violations()
            this.average_violations[0] += inspection_violations[0]
            this.average_violations[1] += inspection_violations[1]
            this.average_violations[2] += inspection_violations[2]
        }
        this.average_violations[0] /= this.inspections.length
        this.average_violations[1] /= this.inspections.length
        this.average_violations[2] /= this.inspections.length
    }

}

// represents the results of one specific inspection of a restaurant.
// stores a date and a list of violations
class Inspection{
    constructor(date){
        this.date = date
        this.violations = []
    }

    // parameters are direct from the spreadsheet. First 3 are strings. Last 4 are bools.
    add_violation(family, code, occurrences, critical_1, critical_2, emergency, variance){
        this.violations.push(new Violation(family, code, occurrences, critical_1, critical_2, emergency, variance))
    }

    // returns an array of length 3. The first 
    total_violations(){
        let amount = [0,0,0];
        for(let i = 0; i < this.violations.length; i++){
            let v = this.violations[i]
            if(this.violations[i].critical_1){
                amount[1] += this.violations[i].occurrences
            }
            else if(this.violations[i].critical_2){
                amount[2] += this.violations[i].occurrences
            }
            else{
                amount[0] += this.violations[i].occurrences
            }
        }
        return amount
    }
}

class Violation{
    // parameters are direct from the spreadsheet. First 3 are strings. Last  are bools.
    constructor(family, code, occurrences, critical_1, critical_2, emergency, variance){
        this.family = family
        this.code = code
        this.occurrences = occurrences
        this.critical_1 = critical_1
        this.critical_2 = critical_2
        this.emergency = emergency
        this.variance = variance
    }
}

// ---------------------- HELPER FUNCTIONS ---------------------------

// used for deriving data from things
let derivative_function = function(x){ return x }

// a function that allows us compare functions by derived values
// the derived value that we are comparing by is stored in the function
// derivative_function
function derivative_compare(x,y){
    let val1 = derivative_function(x)
    let val2 = derivative_function(y)
    if(val1 < val2){
        return -1
    }
    if(val1 > val2){
        return 1
    }
    return 0
}

// allows us to sort by derivative compare,
// but in reverse
function reverse_derivative_compare(x,y){
    return -1*derivative_compare(x,y)
}

// -------------------------- MAIN ----------------------------------------------

function process_data(data){
    data = data.data

    let first_row = data[0]
    let restaurant = new Restaurant(first_row[0], first_row[2], first_row[3], first_row[4])
    let inspection = new Inspection(first_row[1])

    // go through all of the data and put it into our lists
    for(let i = 0; i < data.length; i++){
        let row = data[i]

        if( restaurant.id !== row[0] ){
        // check if we are done with the current restaurant

            // add the current inspection to the restaurant
            restaurant.add_inspection(inspection)

            // calculate the statistics of the previous restaurant and add to list
            restaurant.calculate_statistics()
            restaurants.push(restaurant)

            // make a new restaurant and inspection
            restaurant = new Restaurant(row[0], row[2], row[3], row[4])
            inspection = new Inspection(row[1])
        }
        else if( inspection.date !== row[1] ){
        // check if we are done with the current inspection

            restaurant.add_inspection(inspection)
            inspection = new Inspection(row[1])
        }

        // add the current inspection
        let code = row[5]
        if( code !== "N/A" ){
            let code_period = code.indexOf(".")
            inspection.add_violation(
                code.substring(0, code_period),
                code.substring(code_period+1),
                row[7], row[8], row[9], row[10], row[11])
        }
    }

    // add the rest of the data
    restaurant.add_inspection(inspection)
    restaurant.calculate_statistics()
    restaurants.push(restaurant)

    done_processing = true
}

// run the processing
fetch(path_to_data).then(response => response.json()).then(data => process_data(data))