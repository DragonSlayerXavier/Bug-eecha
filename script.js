const MAX_HEARTS = 10;
const MAX_QUESTIONS = 5;
var killed = 0;
var f1k = false, f2k = false, f3k = false;
var data, rand = -1;
var hearts = MAX_HEARTS;
var picked = [];
var inc_array = [];
var logs = "$$$$$$$$$$$$$$$\r\n";
var futile = 0;
async function load() {
    await fetch("data.json").then(response => response.json()).then(json => data = json);
    heart_init();
    qload();
}

function setAttributes(el, attrs) {
    for (var key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}

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
    //document.getElementById("input1").focus();
}

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

function validate(input, output) {
    for (var i = 0; i < data.database[rand].count; i++) {
        if (data.database[rand].in[i] == "number") {
            if (isNaN(input[i])) {
                document.getElementById(`input${i + 1}`).value = "";
                document.getElementById(`input${i + 1}`).focus();
                alert(`Input ${i + 1} must be a number.`);
                return false;
            }
        }
        if (data.database[rand].in[i] == "string") {
            var args = document.getElementById(`input${i + 1}`).value;
            if (args[0] != '"' || args[args.length - 1] != '"') {
                alert(`Please follow valid string formatting for Input ${i + 1}.`);
                return false;
            }
        }
        if (data.database[rand].in[i] === "str_array" || data.database[rand].in[i] === "num_array" || data.database[rand].in[i] === "sorted_num_array") {
            var args = document.getElementById(`input${i + 1}`).value;
            if (args[0] != '[' || args[args.length - 1] != ']') {
                alert(`Please follow valid array formatting for Input ${i + 1}.`);
                return false;
            }
        }
        if (data.database[rand].in[i] == "str_array") {
            var args = document.getElementById(`input${i + 1}`).value;
            if (args[1] != '"' || args[args.length - 2] != '"') {
                alert(`Please follow valid string formatting for Input ${i + 1}.`);
                return false;
            }
        }
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
        if (data.database[rand].in[i] === "sorted_num_array") {
            for (var j = 0; j < input[i].length - 1; j++) {
                if (parseInt(input[i][j]) > parseInt(input[i][j + 1])) {
                    document.getElementById(`input${i + 1}`).value = "";
                    document.getElementById(`input${i + 1}`).focus();
                    alert(`Input ${i + 1} must be a sorted array of numbers.`);
                    return false;
                }
            }
        }
    }
    if (data.database[rand].out === "number") {
        if (isNaN(output)) {
            document.getElementById("output").value = "";
            document.getElementById("output").focus();
            alert("Output must be a number.");
            return false;
        }
    }
    if (data.database[rand].out === "string") {
        var args = document.getElementById("output").value;
        if (args[0] != '"' || args[args.length - 1] != '"') {
            alert("Please follow valid string formatting for Output.");
            return false;
        }
    }
    if (data.database[rand].out === "str_array" || data.database[rand].out === "num_array" || data.database[rand].out === "sorted_num_array") {
        var args = document.getElementById("output").value;
        if (args[0] != '[' || args[args.length - 1] != ']') {
            alert("Please follow valid array formatting for Output.");
            return false;
        }
    }
    if (data.database[rand].out === "str_array") {
        var args = document.getElementById("output").value;
        if (args[1] != '"' || args[args.length - 2] != '"') {
            alert("Please follow valid string formatting for Output.");
            return false;
        }
    }
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
    if (data.database[rand].out === "sorted_num_array") {
        for (var j = 0; j < output.length - 1; j++) {
            if (parseInt(output[j]) > parseInt(output[j + 1])) {
                document.getElementById("output").value = "";
                document.getElementById("output").focus();
                alert("Output must be a sorted array of numbers.");
                return false;
            }
        }
    }
    return true;
}

function customValidate(input) {
    if(!data.database[rand].customValidate) {
        return true;
    }
    var f = new Function(...(data.database[rand].valFunc.arguments), data.database[rand].valFunc.body);
    if(!f(...input)){
        alert("Please follow input specifications.");
        return false;
    }
    return true;
}

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

function updateInputType(input) {
    var arr = [];
    for (var i = 0; i < data.database[rand].count; i++) {
        if (data.database[rand].in[i] == "number") {
            arr.push(parseInt(input[i]));
            continue;
        }
        if (data.database[rand].in[i] == "num_array" || data.database[rand].in[i] == "sorted_num_array") {
            arr[i] = [];
            for (var j = 0; j < input[i].length; j++) {
                if (!isNaN(parseInt(input[i][j]))) {
                    arr[i].push(parseInt(input[i][j]));
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

function updateOutputType(output) {
    if (data.database[rand].out == "number") {
        var res = parseInt(output);
        return res;
    }
    if (data.database[rand].out == "num_array" || data.database[rand].out == "sorted_num_array") {
        var res = [];
        for (var j = 0; j < output.length; j++) {
            if (!isNaN(parseInt(output[j]))) {
                res.push(parseInt(output[j]));
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

function clear_and_focus() {
    for (var i = 1; i <= data.database[rand].count; i++) {
        document.getElementById(`input${i}`).value = "";
    }
    document.getElementById("output").value = "";
    document.getElementById("input1").focus();
}

function appendInputToLogs(arr) {
    res = "";
    if(!arr.length) return arr;
    for (var i = 0; i < arr.length; i++) {
        if (data.database[rand].in[i] == "num_array" || data.database[rand].in[i] == "str_array" || data.database[rand].in[i] == "sorted_num_array") {
            res += `[${arr[i]}],`;
        } else {
            res += `${arr[i]},`;
        }
    }
    return res.substring(0, res.length - 1);
}

function appendOutputToLogs(arr) {
    res = "";
    if(!arr.length) return arr;
    if (data.database[rand].out == "num_array" || data.database[rand].out == "str_array" || data.database[rand].out == "sorted_num_array") {
        res += `[${arr}]`;
    } else {
        res += `${arr}`;
    }
    return res;
}

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
    if(!customValidate(inp)) {
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
        logs = logs.concat(`Input: ${appendInputToLogs(inp)}. Output: ${appendOutputToLogs(out)}. Incorrect. Heart lost.\r\n`);
        return;
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

function function1(input) {
    var f = new Function(...(data.database[rand].incorrect[0].arguments), data.database[rand].incorrect[0].body);
    return f(...input);
}

function function2(input) {
    var f = new Function(...(data.database[rand].incorrect[1].arguments), data.database[rand].incorrect[1].body);
    return f(...input);
}

function function3(input) {
    var f = new Function(...(data.database[rand].incorrect[2].arguments), data.database[rand].incorrect[2].body);
    return f(...input);
}

function function4(input) {
    var f = new Function(...(data.database[rand].correct.arguments), data.database[rand].correct.body);
    return f(...input);
}

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

function isSorted(arr) {
    for (var i = 1; i < arr.length; i++) {
        if (arr[i - 1] > arr[i]) return false;
    }
    return true;
}

function resultCheck(a1, a2) {
    if(data.database[rand].out == "number" || data.database[rand].out == "string") {
        return a1 === a2;
    }
    if (a1.length != a2.length) return false;
    for(var i = 0; i < a1.length; i++) {
        if(a1[i] != a2[i]) return false;
    }
    return true;
}
