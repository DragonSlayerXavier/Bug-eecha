const MAX_HEARTS = 10; // Change this to change the number of hearts the player starts with
const MAX_QUESTIONS = 5; // Change this to change the number of questions the player has to answer
var killed = 0; // Number of functions killed. Resets every round.
var f1k = false, f2k = false, f3k = false; // Whether the function has been killed or not
var data, rand = -1; // Data is the JSON file, rand is the random number generated.
var hearts = MAX_HEARTS; // Number of hearts the player has. Persists through rounds.
var picked = []; // Array of questions already picked. To ensure that random selection never picks the same question twice.
var inc_array = []; // Array of incorrect functions: which boxes represent the incorrect functions. Resets every round.
var logs = "$$$$$$$$$$$$$$$\r\n"; // Logs of the game. Persists through rounds.
var futile = 0; // Number of futile attempts. Set through the JSON.

/**
 * Initializes number of hearts at the start of the game.
 */
function heart_init() {
    for (var i = 1; i <= hearts; i++) {
        var div = document.createElement("div");
        var heart = document.createElement("img");
        heart.setAttribute("class", "empty");
        setAttributes(heart, { "class": "fill", "id": `heart${MAX_HEARTS - i + 1}`, "width": "40px", "height": "40px" });
        div.appendChild(heart);
        document.getElementById("heart_div").appendChild(div);
    }
    logs = logs.concat(`Started game with ${MAX_HEARTS} hearts.\r\n`);
}

/**
 * Creates the array of which boxes to associate with incorrect functions.
 * @param {Number} n The total number of boxes (One of which will be assigned the correct function)
 * @returns {Array} A list of length n-1, with the correct function's box number missing.
 */
function create_inc_array(n) {
    var arr = [];
    for (var i = 0; i < n; i++) {
        arr.push(i + 1);
    }
    var random = Math.floor(Math.random() * arr.length);
    var farr = [];
    for (var i = 0; i < n; i++) {
        if (i == random) continue;
        farr.push(arr[i]);
    }
    return farr;
}

/**
 * Ends the round and resets the UI for the next round.
 * Also resets all variables that are supposed to reset every round.
 */
function end_game() {
    document.getElementById("win").setAttribute("style", "display: none;");
    document.getElementById("nq").setAttribute("style", "display: none;");
    document.getElementById("execute").setAttribute("onclick", "runFunc()");
    document.getElementById("f1box").style.fill = "rgb(0,255,0)";
    document.getElementById("f2box").style.fill = "rgb(0,255,0)";
    document.getElementById("f3box").style.fill = "rgb(0,255,0)";
    document.getElementById("f4box").style.fill = "rgb(0,255,0)";
    inc_array = create_inc_array(4);
    const input = document.getElementById("input_div");
    while (input.firstChild) {
        input.removeChild(input.lastChild);
    }
    const past = document.getElementById("past-inputs");
    while (past.firstChild) {
        past.removeChild(past.lastChild);
    }
    past.innerHTML = "";
    killed = 0;
    f1k = false;
    f2k = false;
    f3k = false;
    futile = 0;
    logs = logs.concat("Round started.\r\n");
}

/**
 * Sets the number of hearts whenever a mistake is made or a heart is awarded.
 * Hearts can be lost for incorrect answers, or for failing to kill any functions for more than a certain number of attempts.
 * Hearts are awarded for killing certain functions.
 */
function setHearts() {
    for (var i = 1; i <= hearts; i++) {
        document.getElementById(`heart${i}`).setAttribute("class", "fill");
    }
    for (var i = hearts + 1; i <= MAX_HEARTS; i++) {
        document.getElementById(`heart${i}`).setAttribute("class", "empty");
    }
    if (hearts == 0) {
        for (var i = 1; i <= data.database[rand].count; i++) {
            document.getElementById(`input${i}`).value = "";
        }
        document.getElementById("output").value = "";
        document.getElementById("execute").setAttribute("onclick", "");
        document.getElementById("loss").setAttribute("style", "display: block;");
        logs = logs.concat("Game over.\r\n###############\r\n");
        console.log(logs);
    }
}

/**
 * Clears the input boxes and focuses on the first input box.
 */
function clear_and_focus() {
    for (var i = 1; i <= data.database[rand].count; i++) {
        document.getElementById(`input${i}`).value = "";
    }
    document.getElementById("output").value = "";
    document.getElementById("input1").focus();
}

/**
 * Sets up the page for every round.
 * This includes questions, correct code, input boxes, output box.
 */
function qload() {
    end_game();
    /*do {
        rand = Math.floor(Math.random() * data.database.length);
    } while (picked.includes(rand));*/ // Uncomment this to enable random question selection
    rand = rand + 1; // Comment this to enable random question selection
    picked.push(rand);
    document.getElementById("question").innerHTML = data.database[rand].question.split("\n").join("<br />");
    document.getElementById("correct-code").innerHTML = data.database[rand].code.split("\n").join("<br />");
    logs = logs.concat(`Question: ${data.database[rand].question}\r\n`);
    for (var i = 1; i <= data.database[rand].count; i++) {
        var div = document.createElement("div");
        setAttributes(div, { "class": "inpdiv", "id": `inpdiv${i}` });
        var label = document.createElement("label");
        label.innerText = data.database[rand].in_label[i - 1];
        setAttributes(label, { "for": `input${i}`, "class": "input_label" });
        var textbox = document.createElement("input");
        setAttributes(textbox, { "type": "text", "id": `input${i}`, "class": "input_box", "name": `input${i}`, "placeholder": data.database[rand].in_desc[i - 1] });
        textbox.setAttribute("size", textbox.getAttribute("placeholder").length);
        div.appendChild(label);
        div.appendChild(document.createElement("br"));
        div.appendChild(textbox);
        document.getElementById("input_div").appendChild(div);
    }
    document.getElementById("output").setAttribute("placeholder", data.database[rand].out_desc);
    document.getElementById("output").setAttribute("size", document.getElementById("output").getAttribute("placeholder").length);
    setHearts();
    clear_and_focus();
}

/**
 * Loads the JSON file and initializes the game.
 */
async function load() {
    await fetch("data.json").then(response => response.json()).then(json => data = json);
    heart_init();
    qload();
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
 * A function to validate whether the input and output are of the expected types.
 * @param {Array} input Array of inputs given by the user.
 * @param {String} output Output given by the user.
 * @returns {Boolean} true or false based on whether the input and output are valid.
 */
function validate(input, output) {
    //Runs a loop to validate every entry in the input array.
    for (var i = 0; i < data.database[rand].count; i++) {
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
        if (data.database[rand].in[i] === "str_array" || data.database[rand].in[i] === "num_array" || data.database[rand].in[i] === "sorted_num_array") {
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
        if (data.database[rand].in[i] === "num_array" || data.database[rand].in[i] === "sorted_num_array") {
            for (var j = 0; j < input[i].length; j++) {
                if (isNaN(input[i][j])) {
                    document.getElementById(`input${i + 1}`).value = "";
                    document.getElementById(`input${i + 1}`).focus();
                    alert(`Input ${i + 1} must be an array of numbers.`);
                    return false;
                }
            }
        }
        //Checks if the elements of a sorted number array are sorted.
        if (data.database[rand].in[i] === "sorted_num_array") {
            for (var j = 0; j < input[i].length - 1; j++) {
                if (Number(input[i][j]) > Number(input[i][j + 1])) {
                    document.getElementById(`input${i + 1}`).value = "";
                    document.getElementById(`input${i + 1}`).focus();
                    alert(`Input ${i + 1} must be a sorted array of numbers.`);
                    return false;
                }
            }
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
    if (data.database[rand].out === "str_array" || data.database[rand].out === "num_array" || data.database[rand].out === "sorted_num_array") {
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
    if (data.database[rand].out === "num_array" || data.database[rand].out === "sorted_num_array") {
        for (var j = 0; j < output.length; j++) {
            if (isNaN(output[j])) {
                document.getElementById("output").value = "";
                document.getElementById("output").focus();
                alert("Output must be an array of numbers.");
                return false;
            }
        }
    }
    //Checks if the elements of a sorted number array are sorted.
    if (data.database[rand].out === "sorted_num_array") {
        for (var j = 0; j < output.length - 1; j++) {
            if (Number(output[j]) > Number(output[j + 1])) {
                document.getElementById("output").value = "";
                document.getElementById("output").focus();
                alert("Output must be a sorted array of numbers.");
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
 * Removes type formatting from input values.
 * This includes double quotes from strings and square brackets from arrays.
 * @param {Number} n The index of the input being updated
 * @returns {String} The updated input.
 */
function handleInput(n) {
    var args = document.getElementById(`input${n + 1}`).value;
    if (data.database[rand].in[n] == "number") {
        return (args.toString());
    }
    if (data.database[rand].in[n] == "string") {
        return (args.substring(1, args.length - 1));
    }
    if (data.database[rand].in[n] == "num_array" || data.database[rand].in[n] == "sorted_num_array" || data.database[rand].in[n] == "str_array") {
        return (args.substring(1, args.length - 1).split(","));
    }
}

/**
 * Removes type formatting from output value.
 * This includes double quotes from strings and square brackets from arrays.
 * @returns {String} The updated output.
 */
function handleOutput() {
    var args = document.getElementById("output").value;
    if (data.database[rand].out == "number") {
        return (args.toString());
    }
    if (data.database[rand].out == "string") {
        return (args.substring(1, args.length - 1));
    }
    if (data.database[rand].out == "num_array" || data.database[rand].out == "sorted_num_array" || data.database[rand].out == "str_array") {
        return (args.substring(1, args.length - 1).split(","));
    }
}

/**
 * Parses the input values to the correct types and creates an array of them
 * @param {Array} input The array of inputs as given by the user after removing type formatting
 * @returns {Array} Parsed input.
 */
function updateInputType(input) {
    var arr = [];
    for (var i = 0; i < data.database[rand].count; i++) {
        if (data.database[rand].in[i] == "number") {
            arr.push(Number(input[i]));
            continue;
        }
        if (data.database[rand].in[i] == "num_array" || data.database[rand].in[i] == "sorted_num_array") {
            arr[i] = [];
            for (var j = 0; j < input[i].length; j++) {
                if (!isNaN(Number(input[i][j]))) {
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
    if (data.database[rand].out == "number") {
        var res = Number(output);
        return res;
    }
    if (data.database[rand].out == "num_array" || data.database[rand].out == "sorted_num_array") {
        var res = [];
        for (var j = 0; j < output.length; j++) {
            if (!isNaN(Number(output[j]))) {
                res.push(Number(output[j]));
            }
        }
        return res;
    }
    if (data.database[rand].in[i] == "str_array") {
        res = JSON.parse(`[${output}]`);
        return res;
    }
    return output;
}

/**
 * Formats input values for appending to the logs.
 * @param {Array} arr The input array.
 * @returns {Array} Formatted input.
 */
function appendInputToLogs(arr) {
    res = "";
    if (!arr.length) return arr;
    for (var i = 0; i < arr.length; i++) {
        if (data.database[rand].in[i] == "num_array" || data.database[rand].in[i] == "str_array" || data.database[rand].in[i] == "sorted_num_array") {
            res += `[${arr[i]}],`;
        } else {
            res += `${arr[i]},`;
        }
    }
    return res.substring(0, res.length - 1);
}

/**
 * Formats output values for appending to the logs.
 * @param {Array} arr The output array.
 * @returns {Array} Formatted output.
 */
function appendOutputToLogs(arr) {
    res = "";
    if (!arr.length) return arr;
    if (data.database[rand].out == "num_array" || data.database[rand].out == "str_array" || data.database[rand].out == "sorted_num_array") {
        res += `[${arr}]`;
    } else {
        res += `${arr}`;
    }
    return res;
}

/**
 * Used to check equality between user output and expected output.
 * @param {Object} a1 The first of the values being compared.
 * @param {Object} a2 The second of the values being compared.
 * @returns {Boolean} If the values are equal.
 */
function resultCheck(a1, a2) {
    if (data.database[rand].out == "number") {
        return a1 == a2;
    }
    if(data.database[rand].out == "string") {
        return a1 === a2;
    }
    if (a1.length != a2.length) return false;
    for (var i = 0; i < a1.length; i++) {
        if (a1[i] != a2[i]) return false;
    }
    return true;
}

/**
 * The first incorrrect function.
 * @param {Array} input The input after parsing.
 * @returns {data.database[rand].out} The function's output.
 */
function function1(input) {
    var f = new Function(...(data.database[rand].incorrect[0].arguments), data.database[rand].incorrect[0].body);
    return f(...input);
}

/**
 * The second incorrect function.
 * @param {Array} input The input after parsing.
 * @returns {data.database[rand].out} The function's output.
 */
function function2(input) {
    var f = new Function(...(data.database[rand].incorrect[1].arguments), data.database[rand].incorrect[1].body);
    return f(...input);
}

/**
 * The third incorrect function.
 * @param {Array} input The input after parsing.
 * @returns {data.database[rand].out} The function's output.
 */
function function3(input) {
    var f = new Function(...(data.database[rand].incorrect[2].arguments), data.database[rand].incorrect[2].body);
    return f(...input);
}

/**
 * The correct function.
 * @param {Array} input The input after parsing.
 * @returns {data.database[rand].out} The function's output.
 */
function function4(input) {
    var f = new Function(...(data.database[rand].correct.arguments), data.database[rand].correct.body);
    return f(...input);
}

/**
 * Updates the status of the box of the first incorrect function.
 * @returns {Execution Abortion} Nothing. Early return to ensure that the function kill is not logged twice.
 */
function killf1() {
    document.getElementById(`f${inc_array[0]}box`).style.fill = "rgb(255,0,0)";
    futile = 0;
    if (data.database[rand].incorrect[0].heart) {
        hearts = (hearts < MAX_HEARTS) ? hearts + 1 : MAX_HEARTS;
        setHearts();
        return logs = logs.concat("Function 1 killed. Heart awarded.\r\n");
    }
    logs = logs.concat("Function 1 killed.\r\n");
}

/**
 * Updates the status of the box of the second incorrect function.
 * @returns {Execution Abortion} Nothing. Early return to ensure that the function kill is not logged twice.
 */
function killf2() {
    document.getElementById(`f${inc_array[1]}box`).style.fill = "rgb(255,0,0)";
    futile = 0;
    if (data.database[rand].incorrect[1].heart) {
        hearts = (hearts < MAX_HEARTS) ? hearts + 1 : MAX_HEARTS;
        setHearts();
        return logs = logs.concat("Function 2 killed. Heart awarded.\r\n");
    }
    logs = logs.concat("Function 2 killed.\r\n");
}

/**
 * Updates the status of the box of the third incorrect function.
 * @returns {Execution Abortion} Nothing. Early return to ensure that the function kill is not logged twice.
 */
function killf3() {
    document.getElementById(`f${inc_array[2]}box`).style.fill = "rgb(255,0,0)";
    futile = 0;
    if (data.database[rand].incorrect[2].heart) {
        hearts = (hearts < MAX_HEARTS) ? hearts + 1 : MAX_HEARTS;
        setHearts();
        return logs = logs.concat("Function 3 killed. Heart awarded.\r\n");
    }
    logs = logs.concat("Function 3 killed.\r\n")
}

/**
 * Function called whenever the user submits their inputs and outputs.
 * @returns {Execution Abortion} Nothing. Early returns to end the function early for invalid inputs and incorrect inputs.
 */
function runFunc() {
    var inp = [];
    var i;
    for (i = 0; i < data.database[rand].count; i++) {
        inp.push(handleInput(i));
    }
    let out = handleOutput();
    if (!validate(inp, out)) {
        return logs = logs.concat(`Input: ${appendInputToLogs(inp)}. Output: ${appendOutputToLogs(out)}. Invalid.\r\n`);
    }
    if (!customValidate(inp)) {
        return logs = logs.concat(`Input: ${appendInputToLogs(inp)}. Output: ${appendOutputToLogs(out)}. Invalid.\r\n`);
    }
    inp = updateInputType(inp);
    out = updateOutputType(out);
    var res1 = 0, res2 = 0, res3 = 0, res4 = 0;
    res4 = function4(inp);
    if (!resultCheck(res4, out)) {
        document.getElementById("output").value = "";
        document.getElementById("output").focus();
        hearts--;
        setHearts();
        return logs = logs.concat(`Input: ${appendInputToLogs(inp)}. Output: ${appendOutputToLogs(out)}. Incorrect. Heart lost.\r\n`);
    }
    logs = logs.concat(`Input: ${appendInputToLogs(inp)}. Output: ${appendOutputToLogs(out)}. Accepted.\r\n`);
    document.getElementById("past-inputs").innerHTML = document.getElementById("past-inputs").innerHTML.concat(appendInputToLogs(inp));
    document.getElementById("past-inputs").appendChild(document.createElement("br"));
    futile++;
    if (!f1k) res1 = function1(inp);
    if (!f2k) res2 = function2(inp);
    if (!f3k) res3 = function3(inp);
    if (!f1k && res1 != res4) { killed++; f1k = true; killf1(); }
    if (!f2k && res2 != res4) { killed++; f2k = true; killf2(); }
    if (!f3k && res3 != res4) { killed++; f3k = true; killf3(); }
    if (data.database[rand].futile && futile > data.database[rand].futile) {
        hearts--;
        logs = logs.concat("Heart lost for futile attempt.\r\n");
        setHearts();
    }
    clear_and_focus();
    if (killed >= 3) {
        document.getElementById("win").setAttribute("style", "display: block;");
        document.getElementById("execute").setAttribute("onclick", "");
        if (picked.length != data.database.length && picked.length != MAX_QUESTIONS) {
            document.getElementById("nq").setAttribute("style", "display: block;");
            logs = logs.concat("Round won.\r\n");
        } else {
            logs = logs.concat("Round won.\r\n");
            logs = logs.concat("Game over.\r\n###############\r\n");
            console.log(logs);
        }
    }
}