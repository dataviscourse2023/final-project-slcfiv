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