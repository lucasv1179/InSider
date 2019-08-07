//GET URL QUERY PARAMETERS
const LOCATION = window.location.search;
var queryParams = {state: "fl"};

if(LOCATION) {
    const QUERY = LOCATION.substring(1).split("&");
    QUERY.forEach(function(query) {
        let queryArray = query.split("=");
        queryParams[queryArray[0]] = queryArray[1];
    });
}

const URL_SENATE = "https://api.propublica.org/congress/v1/113/senate/members.json";
const URL_HOUSE = "https://api.propublica.org/congress/v1/113/house/members.json";
const URL_OS_METADATA = "https://openstates.org/api/v1/metadata/?apikey=679388b3-e19a-431d-9bfb-ff765bc67146";//resources/openstates\ metadata.json";
const URL_OS_STATE_METADATA = "https://openstates.org/api/v1/metadata/" + queryParams.state + "/?apikey=679388b3-e19a-431d-9bfb-ff765bc67146";//"resources/openstates\ state\ legislators.json";
const URL_OS_STATE_LEGISLATORS = "https://openstates.org/api/v1/legislators/?state=" + queryParams.state + "&apikey=679388b3-e19a-431d-9bfb-ff765bc67146";//"resources/openstates\ state\ metadata.json";

//SETUP REQUEST BASED ON PAGE BODY ID
var bodyID = document.getElementsByTagName("body").item(0).id;
var requests = [];

if(bodyID.includes("house")) {

    requests.push(
        {url: URL_HOUSE, dataToFetch: "memberDataHouse", fetchOptions: {headers: { "X-API-Key": "YRTJlbieTGv2HlcXHMRLh7Ogbg0ySXh9MUYTvw1y"}}},
        {url: URL_OS_METADATA, dataToFetch: "legislatorsDataMD"});

} else if (bodyID.includes("senate")) {

    requests.push(
        {url: URL_SENATE, dataToFetch: "memberDataSenate", fetchOptions: {headers: { "X-API-Key": "YRTJlbieTGv2HlcXHMRLh7Ogbg0ySXh9MUYTvw1y"}}},
        {url: URL_OS_METADATA, dataToFetch: "legislatorsDataMD", headers: {}});

} else if (bodyID.includes("legislators")) {

    requests.push(
        {url: URL_OS_STATE_LEGISLATORS, dataToFetch: "legislatorsDataSL" + "-" + queryParams.state, fetchOptions: {headers: {}}},
        {url: URL_OS_METADATA, dataToFetch: "legislatorsDataMD", fetchOptions: {headers: {}}},
        {url: URL_OS_STATE_METADATA, dataToFetch: "legislatorsDataSMD", fetchOptions: {headers: {}}});

} else {

    requests.push({url: URL_OS_METADATA, dataToFetch: "legislatorsDataMD", fetchOptions: {headers: {}}}, {url: URL_OS_METADATA, dataToFetch: "legislatorsDataMD", fetchOptions: {headers: {}}});
}

//FETCH DATA FUNCTION
function getData() {

    let dataArray = [];
    let doRequest = false;

    requests.forEach( request => {
        if(!localStorage.getItem(request.dataToFetch)) {
            doRequest = true;
        }
    });

    if(doRequest) {
        dataArray = Promise.all(requests.map(request => 
            fetch(request.url, request.fetchOptions)
            .then(response => response.json())));
        
        dataArray.then( data => {
            for(let i = 0; i < requests.length; ++i) {
                localStorage.setItem(requests[i].dataToFetch, JSON.stringify(data[i]));
            }
        });

        return dataArray;

    } else {
        let promiseArray = [];
        for(let i = 0; i < requests.length; ++i) {
            promiseArray.push(JSON.parse(localStorage.getItem(requests[i].dataToFetch)));
        }
        return Promise.all(promiseArray);

    }

}

var mixin, app, glance, most, least, legislature;

getData().then( memberData => {

    legislature = new Vue({
        el: "#legislature",
        data: {
            states: memberData[1]
        },
        computed: {
            sortedStates: function() {
                function compare(a, b) {
                if (a.abbreviation < b.abbreviation)
                    return -1;
                if (a.abbreviation > b.abbreviation)
                    return 1;
                return 0;
                }
            
                return this.states.sort(compare);
            }
          }
    });


    if(bodyID.includes("attendance") || bodyID.includes("loyalty")) {
        
        calculateStats(memberData[0]);

        var paramToEval;

        if(bodyID.includes("attendance")) {
            paramToEval = "engaged";
        } else if (bodyID.includes("loyalty")) {
            paramToEval = "loyal";
        }

        mixin = {
            data: {
                members: memberData[0].results[0].members
            },
            computed: {
                param: function () {
                  return this[paramToEval].map( memberLoc => {
                    return {
                        member: this.members[memberLoc[1]].first_name + " " + (this.members[memberLoc[1]].middle_name || "") + " " + this.members[memberLoc[1]].last_name,
                        url: this.members[memberLoc[1]].url,
                        missedVotes: Math.ceil(this.members[memberLoc[1]].total_votes * memberLoc[0] / 100),
                        missedVotesPct: round(memberLoc[0], 2)
                    };
                  });
                }
            }
        };

        glance = new Vue({
            mixins: [mixin],
            el: "#glance",
            data: {
                atAGlance: STATS.senate_at_a_glance
            }
        });

        least = new Vue({
            mixins: [mixin],
            el: "#least",
            data: {
                engaged: STATS.least_engaged,
                loyal: STATS.least_loyal
            }
        });

        most = new Vue({
            mixins: [mixin],
            el: "#most",
            data: {
                engaged: STATS.most_engaged,
                loyal: STATS.most_loyal
            }
        });

    } else if (bodyID === "house" || bodyID === "senate") {

        app = new Vue({
            el: "#member-data",
            data: {
                members: memberData[0].results[0].members
            },
        });

        $(".iframe").colorbox({iframe:true, width:"80%", height:"80%"});

        //DATATABLE
        $.fn.dataTable.ext.search.push(
            function( settings, data, dataIndex ) {
                var R = $('#R').prop('checked');
                var I = $('#I').prop('checked');
                var D = $('#D').prop('checked');

                var party = data[1] || 0; // use data for the party column
        
                if(R || I || D) {
                    if(R && party === 'R') {
                        return true;
                    } else if (I && party === 'I') {
                        return true;
                    } else if (D && party === 'D') {
                        return true;
                    }
                    return false;
                } else {
                    return true;
                }
            }
        );
        
        $(document).ready( function() {
            var table = $('#member-data').DataTable( {
                /* "scrollY": "400px",
                "scrollCollapse": true,
                "paging": false */
            });

            $('[type]:checkbox').change( function() {
                table.draw();
            });
        });

    } else if(bodyID === "legislators") {
        app = new Vue({
            el: "#member-data",
            data: {
                members: memberData[0],
                stateMD: memberData[2]
            },
            computed: {
                membersWPhoto: function() {
                    return this.members.filter(member => member.active === true)
                        .map(member => {
                        member.chamberTitle = this.stateMD.chambers[member.chamber === "legislature" ? "upper" : member.chamber].title;
                        return member;
                    });
                }
            }
        });

        $(".iframe").colorbox({iframe:true, width:"80%", height:"80%"});

        var table = $('#member-data').DataTable( {
            /* "scrollY": "400px",
            "scrollCollapse": true,
            "paging": false */
            order: [[1, "asc"]]
        });

    }

}).catch(e => console.log(`Failed: ${e}`));

//CHECK FOR LOCAL STORAGE SUPPORT
function storageAvailable(type) { //type is either 'localStorage' or 'sessionStorage'
    var storage;
    try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}
