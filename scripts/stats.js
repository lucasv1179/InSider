function round(num, places) {
    let positions = Math.pow(10, places);
    return (Math.round(num * positions) / positions);
}

function getEndKPercent(MEMBERS, k, property, statPosition, order) {
    let n = MEMBERS.length;
    let m = 0;
    let kPercentArray = [];

    while ( (m / n) < k ) {
        kPercentArray = kPercentArray.concat(findInArray(MEMBERS, kPercentArray, property, order));
        m = kPercentArray.length;
    }
    
    kPercentArray.forEach(array => {
        STATS[statPosition].push(array);
    });

    getStragglers(MEMBERS, kPercentArray[kPercentArray.length - 1], property, statPosition);
}

function getStragglers(MEMBERS, lastArray, property, statPosition) {
    for(let i = lastArray[1] + 1; i < MEMBERS.length; ++i) {
        
        if(MEMBERS[i][property] === lastArray[0]) {
            STATS[statPosition].push([MEMBERS[i][property], i]);
        }
    }
}

function findInArray(MEMBERS, kPercentArray, property, order) {

    let comparandIndex = 0;
    let condition;
    let meetsConditionArray = [];

    if(kPercentArray !== undefined && kPercentArray.length != 0) {
        kPercentArray.forEach(pair => {
            if(comparandIndex === pair[1]) {
                ++comparandIndex;
            }
        });
    }

    let comparand = MEMBERS[comparandIndex][property];

    main: for(let i = 0; i < MEMBERS.length; ++i) {

        for(let j = 0; j < kPercentArray.length; ++j) {
            if(kPercentArray[j][1] === i) {
                continue main;
            }
        }

        condition = order === 0 ? MEMBERS[i][property] < comparand : MEMBERS[i][property] > comparand;

        if(condition) {
            comparand = MEMBERS[i][property];
            comparandIndex = i;
        }
        
    }

    meetsConditionArray.push([comparand, comparandIndex]);

    return meetsConditionArray;
}

//CALCULATE STATS
//---------------
function calculateStats(data) {

    //CREATE 3 ARRAYS FOR EACH PARTY
    const MEMBERS = data.results[0].members;
    const DEMS = [], REP = [], INDEP = [];

    for (let i = 0; i < MEMBERS.length; ++i) {
        switch (MEMBERS[i].party) {
            case "R":
                REP.push(MEMBERS[i]);
                break;
            case "D":
                DEMS.push(MEMBERS[i]);
                break;
            case "I":
                INDEP.push(MEMBERS[i]);
                break;
            default:
                console.log("PARTY NOT VALID.");
        }
    }

    //NUMBER OF REPS PER PARTY
    STATS.senate_at_a_glance[0].number = DEMS.length;
    STATS.senate_at_a_glance[1].number = REP.length;
    STATS.senate_at_a_glance[2].number = INDEP.length;

    //AVERAGE PERCENTAGE OF VOTES WITH PARTY
    let percentageSum = 0;

    DEMS.forEach(member => {
        percentageSum += member.votes_with_party_pct;
    });
    STATS.senate_at_a_glance[0].votes_percent = DEMS.length > 0 ? round((percentageSum / DEMS.length), 2) : 0;

    percentageSum = 0;
    REP.forEach(member => {
        percentageSum += member.votes_with_party_pct;
    });
    STATS.senate_at_a_glance[1].votes_percent = REP.length > 0 ? round((percentageSum / REP.length), 2) : 0;

    percentageSum = 0;
    INDEP.forEach(member => {
        percentageSum += member.votes_with_party_pct;
    });
    STATS.senate_at_a_glance[2].votes_percent = INDEP.length > 0 ? round((percentageSum / INDEP.length), 2) : 0;

    //CALCULATE ONLY WHAT IS NECESSARY BASED ON PAGE BODY ID
    var bodyID = document.getElementsByTagName("body").item(0).id;

    if(bodyID === "house-attendance" || bodyID === "senate-attendance") {

        //LOWEST 10% ATTENDANCE
        getEndKPercent(MEMBERS, 0.1, "missed_votes_pct", "least_engaged", 1);
        //HIGHEST 10% ATTENDANCE 
        getEndKPercent(MEMBERS, 0.1, "missed_votes_pct", "most_engaged", 0);

    } else {

        //LOWEST 10% PARTY LOYALTY
        getEndKPercent(MEMBERS, 0.1, "votes_with_party_pct", "least_loyal", 0);
        //HIGHEST 10% PARTY LOYALTY
        getEndKPercent(MEMBERS, 0.1, "votes_with_party_pct", "most_loyal", 1);

    }
}

//STATISTICS DATA ARRAY
const STATS = {
    "senate_at_a_glance":
        [
            {party: "Democrats"},
            {party: "Republicans"},
            {party: "Independent"}
        ],
    "least_engaged":
        [],
    "most_engaged":
        [],
    "least_loyal":
        [],
    "most_loyal":
        []
};

