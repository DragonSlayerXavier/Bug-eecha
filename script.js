var data; // The JSON file
var MAX_LIVES; // The maximum number of lives
var lives; // The current number of lives
var rand = -1;
var picked = [];
var killed = [];
var logs = "$$$$$$$$$$$$$$$\r\n";
var displayHistory = false;
var futile = 0;

function toggleHistory() {
    if(displayHistory) {
        document.getElementById("input_history").setAttribute("style", "display: none;");
        document.getElementById("history").innerHTML = "Show History";
        displayHistory = false;
    } else {
        document.getElementById("input_history").setAttribute("style", "display: block;");
        document.getElementById("history").innerHTML = "Hide History";
        displayHistory = true;
    }
}

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
    logs = logs.concat(`Started game with ${MAX_LIVES} lives.\r\n`);
}

function end_round() {
    document.getElementById("result").setAttribute("style", "display: none;");
    document.getElementById("fun_check").setAttribute("onclick", "execute();");
    const input = document.getElementById("fun_input_div");
    while (input.firstChild) {
        input.removeChild(input.lastChild);
    }
    document.getElementById("history_p").innerHTML = "";
    killed = [];
    futile = 0;
    logs = logs.concat("Round started.\r\n");
}

function setLives() {
    for (var i = 1; i <= lives; i++) {
        document.getElementById(`flower${i}`).setAttribute("class", "alive");
    }
    for (var i = lives + 1; i <= MAX_LIVES; i++) {
        document.getElementById(`flower${i}`).setAttribute("class", "dead");
    }
    if (lives == 0) {
        for (var i = 1; i <= data.database[rand].count; i++) {
            document.getElementById(`input${i}`).value = "";
        }
        document.getElementById("output").value = "";
        document.getElementById("fun_check").setAttribute("onclick", "");
        document.getElementById("result").setAttribute("style", "display: block;");
        document.getElementById("result").innerHTML = data.lossMessage;
        logs = logs.concat("Game over.\r\n###############\r\n");
        console.log(logs);
    }
}

function clear_and_focus() {
    for (var i = 1; i <= data.database[rand].count; i++) {
        document.getElementById(`input${i}`).value = "";
    }
    document.getElementById("output").value = "";
    document.getElementById("input1").focus();
}

function qload() {
    end_round();
    /*do {
        rand = Math.floor(Math.random() * data.database.length);
    } while (picked.includes(rand));*/ // Uncomment this to enable random question selection
    rand = rand + 1; // Comment this to enable random question selection
    picked.push(rand);
    document.getElementById("ques").innerHTML = data.database[rand].question.split("\n").join("<br />");
    var code = data.database[rand].code.split("\n").join("<br />");
    document.getElementById("code").innerHTML = code.split("\t").join("<span class=\"tab\"></span>");
    logs = logs.concat(`Question: ${data.database[rand].question}\r\n`);
    for (var i = 1; i <= data.database[rand].count; i++) {
        var span = document.createElement("span");
        setAttributes(span, { "class": "p_input", "id": `p_input${i}` });
        var textbox = document.createElement("input");
        setAttributes(textbox, { "type": "text", "class": "input", "name": "input", "id": `input${i}` , "placeholder": `(${data.database[rand].correct.arguments[i - 1]})`});
        span.appendChild(textbox);
        document.getElementById("fun_input_div").appendChild(span);
        if(i != data.database[rand].count) {
            var comma = document.createElement("span");
            comma.innerHTML = ", ";
            document.getElementById("fun_input_div").appendChild(comma);
        }
    }
    document.getElementById("bugs1").innerHTML = `0/${data.database[rand].numFunc}`;
    document.getElementById("fun_name").innerHTML = data.database[rand].name;
    setLives();
    clear_and_focus();
}

async function load() {
    await fetch("data.json").then(response => response.json()).then(json => data = json);
    lives_init();
    qload();
}

function execute() {

}