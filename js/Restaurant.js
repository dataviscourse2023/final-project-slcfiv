// Represents a restaurant and stores all of the inspections of the restaurant
class Restaurant {
  // parameters are direct from the spreadsheet. All are strings.
  constructor(id, name, address, town) {
    this.id = id;
    this.name = name.toUpperCase();
    this.address = address;
    this.town = town.toUpperCase();

    // average number of inspections for each of the types
    this.noncrit = null;
    this.crit1 = null;
    this.crit2 = null;

    // array holding objects of type inspection. Must be added with add_inspection.
    this.inspections = [];
    // will have length 3. First entry is average non-critical, then average critical 1, then average critical 2.
    // Note: Average is the average amount per visit.
    // if all entries are -1 it means that the statistics have not yet been calculated.
    this.average_violations = [-1, -1, -1];
  }

  // parameter i is an object of type inspection.
  add_inspection(i) {
    this.inspections.push(i);
  }

  calculate_statistics() {
    this.average_violations = [0, 0, 0];
    for (let i = 0; i < this.inspections.length; i++) {
      let inspection_violations = this.inspections[i].total_violations();
      this.average_violations[0] += inspection_violations[0];
      this.average_violations[1] += inspection_violations[1];
      this.average_violations[2] += inspection_violations[2];
    }
    this.average_violations[0] /= this.inspections.length;
    this.average_violations[1] /= this.inspections.length;
    this.average_violations[2] /= this.inspections.length;

    this.noncrit = this.average_violations[0];
    this.crit1 = this.average_violations[1];
    this.crit2 = this.average_violations[2];
    // assign average inspections accordingly, for use in creating the table
  }

  still_open(){
    for( let i = 0; i < this.inspections.length; i++){
      if(this.inspections[i].date.includes("2023")){
        return true;
      }
    }
    return false;
  }
}
