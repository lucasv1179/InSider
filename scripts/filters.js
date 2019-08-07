//TABLE FILTER ARRAY
const FILTER = [["R", false], ["D", false], ["I", false], ["STATE", ""]];

//SET EVENT HANDLERS
var select = document.getElementById("state-select");
try {
    select.addEventListener("change", () => updateFilter(event));
} catch (e) {
    console.log(e.message);
}

var checkboxes = document.querySelectorAll("#checkboxes input");
try {
    checkboxes.forEach(input => 
        input.addEventListener("change", () => updateFilter(event))
    );
} catch (e) {
    console.log(e.message);
}

//UPDATE FILTER BASED ON USER SELECTION
function updateFilter(event) {
    if (event.target.id === "state-select") {
        FILTER[3][1] = event.target.value;
    } else {
        let target = event.target.id;
        let isChecked = event.target.checked;
        switch (target) {
            case "R":
                FILTER[0][1] = isChecked;
                break;
            case "D":
                FILTER[1][1] = isChecked;
                break;
            case "I":
                FILTER[2][1] = isChecked;
                break;
            default:
                console.log("There was an error in function updateFilter.");
        }
    }

    filterTable();
}

//Filter table based on current state of filter array
function filterTable() {
    const MEMBERS_CONTAINER = document.getElementById("member-data");
    const MEMBER_ROWS = MEMBERS_CONTAINER.lastChild.children;
    for (let i = 0; i < MEMBER_ROWS.length; ++i) {
        let unchecked = 0;
        for (let j = 0; j < FILTER.length - 1; ++j) {
            if (!FILTER[j][1]) {
                ++unchecked;
            }
            if (FILTER[j][0] === MEMBER_ROWS[i].childNodes.item(2).firstChild.nodeValue && unchecked !== 3) {
                MEMBER_ROWS[i].hidden = !FILTER[j][1];
            } else if (unchecked === 3) {
                MEMBER_ROWS[i].hidden = false;
            }
        }
        if (FILTER[3][1] !== MEMBER_ROWS[i].childNodes.item(4).firstChild.nodeValue && FILTER[3][1] !== "") {
            MEMBER_ROWS[i].hidden = true;
        }
    }
}

