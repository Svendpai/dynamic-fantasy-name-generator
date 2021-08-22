let maxNumberOfNames = 0;
let maxNumberOfLetters = 0;
let maxPairCount = 0;

let nameIndex = 0
let genderIndex = 1
let countIndex = 2

let pairdata = [];
let names = [];
let validLetters = []
let DATA_CSV = ''

nameLength = 6;
nameStartLetter = ""
nameEndLetter = ""
sampleSize = 2;
dataFileName = "names.csv"


function makeFirstLetterCapital(string) {
    return string.substring(0, 1).toUpperCase() + string.substring(1, string.length)
}

async function init() {
    fetch(dataFileName)
        .then(response => response.text())
        .then(_data => {
            parseCSV(_data).then(_csv => {
                DATA_CSV = _csv
                getNames(_csv).then(() => {
                    getValidLetters().then(() => {
                        createLetterObjects().then(() => {
                            getCount().then(() => {
                                getPercent().then(() => {
                                    sortByCount().then(() => {
                                        ready()
                                    })
                                })
                            })
                        })
                    })
                })

            })
        });
}

function setNameLength(length) {
    nameLength = length
}

function setFirstLetter(letter) {
    nameStartLetter = letter
}

function getDATA() {
    console.log(DATA_CSV)
    console.log(names)
    console.log(pairdata)
}

function getPairdata() {
    return pairdata
}

function getNames() {
    return names
}

function tempName() {
    return names[1].name
}

async function parseCSV(str) {
    var arr = [];
    var quote = false;  // 'true' means we're inside a quoted field

    // Iterate over each character, keep track of current row and column (of the returned array)
    for (var row = 0, col = 0, c = 0; c < str.length; c++) {
        var cc = str[c], nc = str[c + 1];        // Current character, next character
        arr[row] = arr[row] || [];             // Create a new row if necessary
        arr[row][col] = arr[row][col] || '';   // Create a new column (start with empty string) if necessary

        // If the current character is a quotation mark, and we're inside a
        // quoted field, and the next character is also a quotation mark,
        // add a quotation mark to the current column and skip the next character
        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }

        // If it's just one quotation mark, begin/end quoted field
        if (cc == '"') { quote = !quote; continue; }

        // If it's a comma and we're not in a quoted field, move on to the next column
        if (cc == ',' && !quote) { ++col; continue; }

        // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
        // and move on to the next row and move to column 0 of that new row
        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }

        // If it's a newline (LF or CR) and we're not in a quoted field,
        // move on to the next row and move to column 0 of that new row
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }

        // Otherwise, append the current character to the current column
        arr[row][col] += cc;
    }
    DATA_CSV = arr
    return arr;
}

async function getNames(csv) {

    for (i in csv) {

        // skips first row
        if (i == 0) {
            continue
        }

        row = csv[i]

        // splits row into cells
        let name = row[nameIndex].toLowerCase();
        let gender = row[genderIndex];
        let count = parseInt(row[countIndex]);

        let alreadyExists = false;

        // Loop over names and check if it already contains the name with that sex
        for (let j = 0; j < names.length; j++) {
            if (names[j].name == name && names[j].gender == gender) {
                alreadyExists = true;
                names[j].count += count;
            }
        }

        // If it doesn't exist make it
        if (!alreadyExists) {
            names.push({
                name: name,
                gender: gender,
                count: count
            })
            maxNumberOfNames += 1
        }
    }

    return names
}

async function getValidLetters() {

    for (let i = 0; i < names.length; i++) {
        for (let j = 0; j < (names[i].name).length; j++) {
            let found = false
            for (let k = 0; k < validLetters.length; k++) {
                if (validLetters[k] == names[i].name[j]) {
                    found = true
                }
            }

            if (!found) {
                validLetters.push(names[i].name[j])
            }
        }
    }

    return validLetters
}

async function createLetterObjects() {

    for (let i = 0; i < validLetters.length; i++) {

        pairdata.push({
            letter: validLetters[i],
            count: 0,
            pairCount: 0,
            start: 0,
            end: 0,
            percentage: 0,
            pairs: []
        })

        // Get the .pairs of the current letter
        let current;
        for (let j = 0; j < pairdata.length; j++) {
            if (pairdata[j].letter == validLetters[i]) {
                current = pairdata[j].pairs
                break;
            }
        }

        // create the pairs
        for (let j = 0; j < validLetters.length; j++) {
            (current).push({
                pair: validLetters[i] + validLetters[j],
                count: 0,
                globalPercentage: 0,
                percentage: 0
            });
        }
    }

    return pairdata
}

async function getCount() {

    for (let i = 0; i < names.length; i++) {
        for (let j = 0; j < pairdata.length; j++) {
            // Count the amount of individual letters
            let findAmountOfLetters = names[i].count * ((names[i].name).split((pairdata[j].letter)).length - 1)
            pairdata[j].count += findAmountOfLetters
            maxNumberOfLetters += findAmountOfLetters

            // Count the amount of times a name starts with the letter
            if ((names[i].name).substring(0, 1) == pairdata[j].letter) {
                pairdata[j].start += names[i].count;
            }

            // Count the amount of times a name ends with the letter
            if ((names[i].name).substring((names[i].name).length - 1, (names[i].name).length) == pairdata[j].letter) {
                pairdata[j].end += names[i].count;
            }

            // Count amount of letter pairs
            for (let k = 0; k < (pairdata[j].pairs).length; k++) {
                pairdata[j].pairs[k].count += names[i].count * ((names[i].name).split((pairdata[j].pairs[k].pair)).length - 1);
            }
        }
    }

    // get total pairCount on each letter
    for (let i = 0; i < pairdata.length; i++) {
        for (let j = 0; j < (pairdata[i].pairs).length; j++) {
            pairdata[i].pairCount += pairdata[i].pairs[j].count;
        }
    }
}

async function getPercent() {

    for (let i = 0; i < pairdata.length; i++) {
        // get letter percentage
        pairdata[i].percentage = pairdata[i].count / maxNumberOfLetters

        for (let j = 0; j < (pairdata[i].pairs).length; j++) {
            // get the percentage of the letter pairs
            pairdata[i].pairs[j].percentage += pairdata[i].pairs[j].count / pairdata[i].pairCount
            pairdata[i].pairs[j].globalPercentage += pairdata[i].pairs[j].count / maxNumberOfLetters
        }
    }
}

// TODO: make better
function generateName() {

    let name = ""

    // find the starting letter
    if (nameStartLetter != "") {
        name += nameStartLetter;
    } else {
        let randomNumber = Math.random();
        let percent = 0;
        for (let i = 0; i < pairdata.length; i++) {
            percent += pairdata[i].percentage

            if (percent >= randomNumber) {
                name += pairdata[i].letter
                break;
            }
        }
    }

    // generate the rest
    for (let i = 0; i < nameLength - 1; i++) {
        let latestLetter = name.substring(name.length - 1, name.length)

        let randomNumber = Math.random()
        let percent = 0
        for (let j = 0; j < pairdata.length; j++) {
            if (pairdata[j].letter == latestLetter) {
                for (let k = 0; k < (pairdata[j].pairs).length; k++) {

                    percent += pairdata[j].pairs[k].percentage

                    if (percent >= randomNumber) {
                        name = name.substring(0, name.length - 1);
                        name += pairdata[j].pairs[k].pair
                        break;
                    }
                }
            }
        }
    }

    return makeFirstLetterCapital(name)

}

function sortByAlphabet() {
    names.sort((a, b) => {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    })

    pairdata.sort((a, b) => {

        for (let i = 0; i < pairdata.length; i++) {
            (pairdata[i].pairs).sort((c, d) => {
                if (c.pair < d.pair) {
                    return -1;
                }
                if (c.pair > d.pair) {
                    return 1;
                }
                return 0;
            })
        }

        if (a.letter < b.letter) {
            return -1;
        }
        if (a.letter > b.letter) {
            return 1;
        }
        return 0;
    })
}

async function sortByCount() {
    names.sort((a, b) => b.count - a.count)

    pairdata.sort((a, b) => b.count - a.count)

    for (let i = 0; i < pairdata.length; i++) {
        (pairdata[i].pairs).sort((a, b) => b.count - a.count)
    }

}

getNames()
getValidLetters()
createLetterObjects()
getCount()
getPercent()

sortByCount()