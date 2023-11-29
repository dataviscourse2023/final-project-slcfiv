// represents the results of one specific inspection of a restaurant.
// stores a date and a list of violations
class Inspection{
    constructor(date){
        this.date = date
        this.violations = []
    }

    // parameters are direct from the spreadsheet. First 3 are strings. Last 4 are bools.
    add_violation(family, code, description, occurrences, critical_1, critical_2, emergency, variance){
        this.violations.push(new Violation(family, code, description, occurrences, critical_1, critical_2, emergency, variance))
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