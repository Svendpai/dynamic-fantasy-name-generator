var button = document.getElementById('generate')
var text = document.getElementById('name')
var pairsList = document.getElementById('pairs-list')
var nameList = document.getElementById('name-list')
var sampleList = document.getElementById('sample-list')

button.disabled = true

window.addEventListener('load', () => {

    init()

    button.addEventListener('click', async () => {
        setNameLength(document.getElementById('name-length').value)
        setStartOfName(document.getElementById('first-letter').value)
        var _name = generateName()
        text.textContent = _name

        createNameElement(_name)
    })

})

function createNameElement(name) {
    let li = document.createElement("li")
    li.setAttribute('id', name)
    li.appendChild(document.createTextNode(name))
    nameList.insertBefore(li, nameList.childNodes[0])
}

async function ready() {
    console.log('READY');
    button.disabled = false;

    // printPairData();

    // printSampleList();

}

function printSampleList() {
    getNames().then(data => {
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            let li = document.createElement('li')
            li.appendChild(document.createTextNode(element.name + ": " + element.count))
            sampleList.appendChild(li)
        }
    })
}

function printPairData() {
    let data = getPairdata()
    for (let i = 0; i < data.length; i++) {

        const element = data[i];

        let li = document.createElement('li')

        let ul = document.createElement('ul')
        let pair = document.createTextNode(element.letter + ": " + element.percentage)

        for (let j = 0; j < element.pairs.length; j++) {
            const element2 = element.pairs[j]

            let li2 = document.createElement('li')
            let pair2 = document.createTextNode(element2.pair + ": " + element2.percentage)

            li2.appendChild(pair2)
            ul.appendChild(li2)
        }

        pairsList.appendChild(li)
        li.appendChild(pair)
        li.appendChild(ul)        
    }
}
