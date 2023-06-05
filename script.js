var data; // The JSON file
var MAX_LIVES; // The maximum number of lives
var lives; // The current number of lives

/**
 * A QOL function to set multiple attributes at once.
 * @param {Object} el The element the attributes are being set to.
 * @param {Array} attrs The list of attributes to be set in the form of key-value pairs.
 */
function setAttributes(el, attrs) {
    for (var key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}

/**
 * Initializes lives at the start of the game.
 */
function lives_init() {
    MAX_LIVES = data.MAX_LIVES;
    lives = MAX_LIVES;
    for (var i = 0; i < lives; i++) {
        var flower = document.createElement("img");
        flower.setAttribute("class", "dead");
        setAttributes(flower, { "class": "alive", "id": `flower${MAX_LIVES - i + 1}` });
        document.getElementById("garden_p").appendChild(flower);
    }
}

function end_round() {
    /*
    TO DO:
    
    */
}

function qload() {
    end_round();
    /*
    TO DO:
    - End the previous game
    - Load the question
    */
}

async function load() {
    await fetch("data.json").then(response => response.json()).then(json => data = json);
    lives_init();
    qload();
}