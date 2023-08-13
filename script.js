var data; // The JSON file
var MAX_LIVES; // The maximum number of lives
var lives; // The current number of lives
var rand = -1; // The index of the current question
var picked = []; // The array of questions that have already been picked
var killed = []; // The array of functions that have already been killed
var displayHistory = false; // Whether or not the history is being displayed
var futile = 0; // The number of times the user has hit check without killing a function.
var found = 0; // The number of buggy functions the user has found.

/**
 * Parses markdown text into HTML.
 * @param {String} text The markdown text to be parsed.
 * @returns {String} The HTML version of the markdown text.
 */
const markdownParser = (text) => {
    const toHTML = text
        .replace(/^\s*\n-/gm, '<ul>\n-')
        .replace(/^(-.+)\s*\n([^-])/gm, '$1\n</ul>\n\n$2')
        .replace(/^-(.+)/gm, '<li>$1</li>') // Unordered Lists
        .replace(/^\s*\n\d\./gm, '<ol>\n1.')
        .replace(/^(\d\..+)\s*\n([^\d\.])/gm, '$1\n</ol>\n\n$2')
        .replace(/^\d\.(.+)/gm, '<li>$1</li>') // Ordered Lists
        .replace(/[\[]{1}([^\]]+)[\]]{1}[\(]{1}([^\)\"]+)(\"(.+)\")?[\)]{1}/g, '<a href="$2" title="$4">$1</a>')  // anchor tags
        .replace(/[\*\_]{2}([^\*\_]+)[\*\_]{2}/g, '<b>$1</b>') // bold text
        .replace(/[\*\_]{1}([^\*\_]+)[\*\_]{1}/g, '<i>$1</i>') // italic text
        .replace(/[\~]{2}([^\~]+)[\~]{2}/g, '<del>$1</del>') // strikethrough text
        .replace(/[\`]{1}([^\`]+)[\`]{1}/g, '<code>$1</code>') // inline code text
        ;
    return toHTML.trim(); // using trim method to remove whitespace
}

/**
 * Shows or hides the input history.
 */
function toggleHistory() {
    if (displayHistory) {
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
        setAttributes(flower, { "class": "alive", "id": `flower${i + 1}` });
        document.getElementById("garden_p").appendChild(flower);
    }
}

/**
 * Ends the previous round and resets all variables and elements.
 */
function end_round() {
    document.getElementById("fun_next_div").setAttribute("style", "display: none;");
    document.getElementById("result").setAttribute("style", "display: none;");
    document.getElementById("fun_check").setAttribute("onclick", "execute();");
    const input = document.getElementById("fun_input_div");
    while (input.firstChild) {
        input.removeChild(input.lastChild);
    }
    document.getElementById("history_p").innerHTML = "";
    killed = [];
    found = 0;
    futile = 0;
}

/**
 * Sets the number of lives.
 */
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
    }
}

/**
 * Clears all textboxes and focuses on the first input.
 */
function clear_and_focus() {
    for (var i = 1; i <= data.database[rand].count; i++) {
        document.getElementById(`input${i}`).value = "";
    }
    document.getElementById("output").value = "";
    document.getElementById("input1").focus();
}

/**
 * Loads the next question.
 */
function qload() {
    end_round();
    /*do {
        rand = Math.floor(Math.random() * data.database.length);
    } while (picked.includes(rand));*/ // Uncomment this to enable random question selection
    rand = rand + 1; // Comment this to enable random question selection
    picked.push(rand);
    document.getElementById("code_div").scrollTop = 0;
    document.getElementById("ques").innerHTML = markdownParser(data.database[rand].question.split("\\*").join("&ast;")).split("\\n").join("\n").split("\n").join("<br>").split("\\t").join("\t").split("\t").join("    ").split("<").join("&lt;").split(">").join("&gt;");
    var code = data.database[rand].code.split("<").join("&lt;").split(">").join("&gt;").split("\\n").join("\n").replace(/(\r\n|\r|\n)+/g, "$1").split("\n").join("<br>").split("\\t").join("\t").split("\t").join("    ");
    if (code.split("<br>").length > 6) {
        document.getElementById("code").innerHTML = (`<code class = "language-${data.database[rand].language}">` + code).split("<br>").join(`</code><code class="language-${data.database[rand].language}">`) + "</code>";
        document.getElementById("code_div").setAttribute("class", "y_scroll");
    } else {
        filler = "";
        for (var i = 0; i < 10 - code.split("<br>").length; i++) {
            filler += "<code class =\"filler\"></code>"
        }
        document.getElementById("code").innerHTML = (`<code class = "language-${data.database[rand].language}">` + code).split("<br>").join(`</code><code class="language-${data.database[rand].language}">`) + "</code>" + filler;
        document.getElementById("code_div").setAttribute("class", "y_scroll_lock");
    }
    Prism.highlightAll();
    document.getElementById("code").setAttribute("class", "code");
    for (var i = 1; i <= data.database[rand].count; i++) {
        var span = document.createElement("span");
        setAttributes(span, { "class": "p_input", "id": `p_input${i}` });
        var textbox = document.createElement("input");
        setAttributes(textbox, { "type": "text", "class": "input", "name": "input", "id": `input${i}`, "placeholder": `(${data.database[rand].correct.arguments[i - 1]})` });
        span.appendChild(textbox);
        document.getElementById("fun_input_div").appendChild(span);
        if (i != data.database[rand].count) {
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

/**
 * Initial page load.
 */
async function load() {
    await fetch("data.json").then(response => response.json()).then(json => data = json);
    lives_init();
    qload();
}

/**
 * Reloads the page.
 */
function reload() {
    picked = [];
    rand = -1;
    const garden = document.getElementById("garden_p");
    while (garden.firstChild) {
        garden.removeChild(garden.lastChild);
    }
    end_round();
    lives_init();
    qload();
}

/**
 * Removes type formatting from input values.
 * This includes double quotes from strings and square brackets from arrays.
 * @param {Number} n The index of the input being updated
 * @returns {String} The updated input.
 */
function handleInput(n) {
    var args = document.getElementById(`input${n}`).value;
    if (data.database[rand].in[n - 1] == "boolean") {
        if (args == "true") {
            return true;
        } else if (args == "false") {
            return false;
        } else {
            return args;
        }
    }
    if (data.database[rand].in[n - 1] == "number") {
        return (args.toString());
    }
    if (data.database[rand].in[n - 1] == "string") {
        return (args.substring(1, args.length - 1));
    }
    if (data.database[rand].in[n - 1] == "num_array" || data.database[rand].in[n - 1] == "str_array") {
        return (args.substring(1, args.length - 1).split(","));
    }
}

/**
 * Removes type formatting from output value.
 * This includes double quotes from strings and square brackets from arrays.
 * @returns {String} The updated output.
 */
function handleOutput() {
    var args = document.getElementById(`output`).value;
    if (data.database[rand].out == "boolean") {
        return (args.toString().toLowerCase());
    }
    if (data.database[rand].out == "number") {
        return (args.toString());
    }
    if (data.database[rand].out == "string") {
        return (args.substring(1, args.length - 1));
    }
    if (data.database[rand].out == "num_array" || data.database[rand].out == "str_array") {
        return (args.substring(1, args.length - 1).split(","));
    }
}

/**
 * A function to validate whether the input and output are of the expected types.
 * @param {Array} input Array of inputs given by the user.
 * @param {String} output Output given by the user.
 * @returns {Boolean} true or false based on whether the input and output are valid.
 */
function validate(input, output) {
    //Runs a loop to validate every entry in the input array.
    for (var i = 0; i < data.database[rand].count; i++) {
        if (data.database[rand].in[i] == "boolean") {
            if (!(input[i] == "true" || input[i] == "false")) {
                document.getElementById(`input${i + 1}`).value = "";
                document.getElementById(`input${i + 1}`).focus();
                alert(`Input ${i + 1} must be a boolean (true or false).`);
                return false;
            }
        }
        //Checks if the input is a number using isNaN.
        if (data.database[rand].in[i] == "number") {
            if (isNaN(input[i])) {
                document.getElementById(`input${i + 1}`).value = "";
                document.getElementById(`input${i + 1}`).focus();
                alert(`Input ${i + 1} must be a number.`);
                return false;
            }
        }
        //Checks if the input is a string surrounded with double quotes.
        if (data.database[rand].in[i] == "string") {
            var args = document.getElementById(`input${i + 1}`).value;
            if (args[0] != '"' || args[args.length - 1] != '"') {
                alert(`Please follow valid string formatting for Input ${i + 1}.`);
                return false;
            }
        }
        //Checks if the input is an array surrounded with square brackets.
        if (data.database[rand].in[i] === "str_array" || data.database[rand].in[i] === "num_array") {
            var args = document.getElementById(`input${i + 1}`).value;
            if (args[0] != '[' || args[args.length - 1] != ']') {
                alert(`Please follow valid array formatting for Input ${i + 1}.`);
                return false;
            }
        }
        //Checks if the elements of a string array are strings surrounded with double quotes.
        if (data.database[rand].in[i] == "str_array") {
            var args = document.getElementById(`input${i + 1}`).value;
            if (args[1] != '"' || args[args.length - 2] != '"') {
                alert(`Please follow valid string formatting for Input ${i + 1}.`);
                return false;
            }
        }
        //Checks if the elements of a number array are numbers using isNaN.
        if (data.database[rand].in[i] === "num_array") {
            for (var j = 0; j < input[i].length; j++) {
                if (isNaN(input[i][j])) {
                    document.getElementById(`input${i + 1}`).value = "";
                    document.getElementById(`input${i + 1}`).focus();
                    alert(`Input ${i + 1} must be an array of numbers.`);
                    return false;
                }
            }
        }
    }
    //Checks if the output is a boolean.
    if (data.database[rand].out === "boolean") {
        if (!(output === "true" || output === "false")) {
            document.getElementById("output").value = "";
            document.getElementById("output").focus();
            alert("Output must be a boolean (true or false).");
            return false;
        }
    }
    //Checks if the output is a number using isNaN.
    if (data.database[rand].out === "number") {
        if (isNaN(output)) {
            document.getElementById("output").value = "";
            document.getElementById("output").focus();
            alert("Output must be a number.");
            return false;
        }
    }
    //Checks if the output is a string surrounded with double quotes.
    if (data.database[rand].out === "string") {
        var args = document.getElementById("output").value;
        if (args[0] != '"' || args[args.length - 1] != '"') {
            alert("Please follow valid string formatting for Output.");
            return false;
        }
    }
    //Checks if the output is an array surrounded with square brackets.
    if (data.database[rand].out === "str_array" || data.database[rand].out === "num_array") {
        var args = document.getElementById("output").value;
        if (args[0] != '[' || args[args.length - 1] != ']') {
            alert("Please follow valid array formatting for Output.");
            return false;
        }
    }
    //Checks if the elements of a string array are strings surrounded with double quotes.
    if (data.database[rand].out === "str_array") {
        var args = document.getElementById("output").value;
        if (args[1] != '"' || args[args.length - 2] != '"') {
            alert("Please follow valid string formatting for Output.");
            return false;
        }
    }
    //Checks if the elements of a number array are numbers using isNaN.
    if (data.database[rand].out === "num_array") {
        for (var j = 0; j < output.length; j++) {
            if (isNaN(output[j])) {
                document.getElementById("output").value = "";
                document.getElementById("output").focus();
                alert("Output must be an array of numbers.");
                return false;
            }
        }
    }
    return true;
}

/**
 * Function for custom validation of the input, if any.
 * Pulls the function from the JSON.
 * @param {Array} input Array of inputs given by the user.
 * @returns {Boolean} true if the input is valid, false otherwise.
 */
function customValidate(input) {
    if (!data.database[rand].customValidate) {
        return true;
    }
    var f = new Function(...(data.database[rand].valFunc.arguments), data.database[rand].valFunc.body);
    if (!f(...input)) {
        alert("Please follow input specifications.");
        return false;
    }
    return true;
}

/**
 * Parses the input values to the correct types and creates an array of them
 * @param {Array} input The array of inputs as given by the user after removing type formatting
 * @returns {Array} Parsed input.
 */
function updateInputType(input) {
    var arr = [];
    for (var i = 0; i < data.database[rand].count; i++) {
        if (data.database[rand].in[i] == "boolean") {
            arr.push(input[i] == "true");
            continue;
        }
        if (data.database[rand].in[i] == "number") {
            arr.push(Number(input[i]));
            continue;
        }
        if (data.database[rand].in[i] == "num_array") {
            arr[i] = [];
            for (var j = 0; j < input[i].length; j++) {
                if (!isNaN(Number(input[i][j])) && input[i][j] != "") {
                    arr[i].push(Number(input[i][j]));
                }
            }
            continue;
        }
        if (data.database[rand].in[i] == "str_array") {
            arr.push(JSON.parse(`[${input[i]}]`));
            continue;
        }
        arr.push(input[i]);
    }
    return arr;
}

/**
 * Parses the output value to the correct type.
 * @param {String} output The output value as given by the user after removing type formatting.
 * @returns {String} Parsed output.
 */
function updateOutputType(output) {
    if (data.database[rand].out == "boolean") {
        var res = (output == "true");
        return res;
    }
    if (data.database[rand].out == "number") {
        var res = Number(output);
        return res;
    }
    if (data.database[rand].out == "num_array") {
        var res = [];
        for (var j = 0; j < output.length; j++) {
            if (!isNaN(Number(output[j])) && output[j] != "") {
                res.push(Number(output[j]));
            }
        }
        return res;
    }
    if (data.database[rand].out == "str_array") {
        res = JSON.parse(`[${output}]`);
        return res;
    }
    return output;
}

/**
 * The correct function for the current question.
 * @param {Array} input The array of inputs to the function.
 * @returns {data.database[rand].out} The function's output.
 */
function correct(input) {
    var f = new Function(...(data.database[rand].correct.arguments), data.database[rand].correct.body);
    return f(...input);
}

/**
 * Function that runs all incorrect functions and marks them as killed if there is a discrepancy in the output.
 * @param {Array} input The array of inputs to the function.
 * @param {data.database[rand].out} output The correct output. 
 */
function incorrect(input, output) {
    var foundInst = 0;
    for (i = 0; i < data.database[rand].numFunc; i++) {
        if (killed.includes(i)) continue;
        var f = new Function(...(data.database[rand].incorrect[i].arguments), data.database[rand].incorrect[i].body);
        if (f(...input) != output) {
            if (data.database[rand].incorrect[i].heart) {
                lives = Math.min(lives + 1, MAX_LIVES)
            }
            killed.push(i);
            foundInst++;
        }
    }
    found += foundInst;
    if (foundInst == 0) {
        futile++;
    } else {
        futile = 0;
    }
}

/**
 * Used to check equality between user output and expected output.
 * @param {Object} a1 The first of the values being compared.
 * @param {Object} a2 The second of the values being compared.
 * @returns {Boolean} If the values are equal.
 */
function resCheck(a1, a2) {
    if (data.database[rand].out == "number") {
        return a1 == a2;
    }
    if (data.database[rand].out == "string") {
        return a1 === a2;
    }
    if (a1.length != a2.length) return false;
    for (var i = 0; i < a1.length; i++) {
        if (a1[i] != a2[i]) return false;
    }
    return true;
}

/**
 * Formats the input to the expected pattern.
 * @param {Array} arr The array of inputs to the function.
 * @returns {Array} The formatted inputs.
 */
function formatInput(arr) {
    res = "";
    if (!arr.length) return arr;
    for (var i = 0; i < arr.length; i++) {
        if (data.database[rand].in[i] == "num_array" || data.database[rand].in[i] == "str_array") {
            res += `[${arr[i]}],`;
        } else {
            res += `${arr[i]},`;
        }
    }
    return res.substring(0, res.length - 1);
}

/**
 * Function called whenever the user submits their inputs and outputs.
 */
function execute() {
    var args = [];
    for (var i = 1; i <= data.database[rand].count; i++) {
        args.push(handleInput(i));
    }
    var output = handleOutput();
    if (!validate(args, output)) {
        return;
    }
    if (!customValidate(args)) {
        return;
    }
    args = updateInputType(args);
    output = updateOutputType(output);
    history_display = formatInput(args);
    correctOutput = correct(args);
    if (!resCheck(output, correctOutput)) {
        document.getElementById("output").value = "";
        document.getElementById("output").focus();
        lives--;
        setLives();
        return;
    }
    incorrect(args, correctOutput);

    document.getElementById("bugs1").innerHTML = `${found}/${data.database[rand].numFunc}`;
    if (futile > data.database[rand].futile) {
        lives--;
        setLives();
    }
    if (found == data.database[rand].numFunc) {
        if (picked.length != data.database.length && picked.length != data.MAX_QUESTIONS) {
            document.getElementById("fun_next_div").setAttribute("style", "display: block;");
        }
        document.getElementById("result").setAttribute("style", "display: block;");
        document.getElementById("result").innerHTML = data.winMessage;
        document.getElementById("fun_check").setAttribute("onclick", "");
    }
    document.getElementById("history_p").innerHTML = document.getElementById("history_p").innerHTML.concat(history_display);
    document.getElementById("history_p").appendChild(document.createElement("br"));
    clear_and_focus();
}
