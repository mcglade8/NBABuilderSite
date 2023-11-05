function handlecsv(element){
    clearOldData();
    var csv = document.getElementById(element).files[document.getElementById(element).files.length-1];
    var reader = new FileReader();
    // save csv to storage as JSON
    reader.onload = function(e){
        var csv = e.target.result;
        var lines = csv.split("\n");
        var result = [];
        var headers = lines[0].split(",");
        for(let i = 1; i < lines.length; i++){
            var obj = {};
            var currentline = lines[i].split(",");
            for(let j = 0; j < headers.length; j++){
                obj[headers[j]] = currentline[j];
            }
            result.push(obj);
        }
        //localStorage.contestData = JSON.stringify(result);
        //location.reload();
        //DKSalariesNBA = result;//JSON.stringify(result);
        getContestData(result);

    }
    reader.readAsText(csv);

}

function clearOldData(){
    var table = document.getElementById("contestDataTable");
    var rows = table.rows;
    for(let i = rows.length-1; i > 0; i--){
        table.deleteRow(i);
    }
    localStorage.removeItem("tableDataNBA");
    localStorage.removeItem("DKSalariesNBA");
}

async function getContestData(DKSalariesNBA){
    var contestData = [];
    localStorage.DKSalariesNBA = JSON.stringify(DKSalariesNBA);
    // Add contest info from uploaded file to contestData
    // var contestDate = document.getElementById("contestDate").value;
    // var contestName = document.getElementById("contestName").value;
    for(let i of DKSalariesNBA){
        if('Game Info' in i) if(i['Game Info'] != undefined) contestData.push(i);
    }

    //addSelectOption(contestName, contestDate);
    addTableRows(contestData);
    

}

// Populates the table with data from contestData
function addTableRows(contestData){
    var table = document.getElementById("contestDataTable");
    var ids = [];
    var rows = table.rows;
    for(let i=0; i < rows.length; i++){
        let r = rows[i];
        if(Number(r.rowIndex)>0) ids.push(r.cells[6].innerHTML.trim());
    }
    for(let p of contestData){
        let opponent = getOpp(p['Game Info'].split(" ")[0], p['TeamAbbrev']);
        // If player is already in table, skip it. Otherwise add to playersInList
        if(!ids.includes(p['ID'])) {
            ids.push(p['ID'].trim());
            var row = table.insertRow(-1);
            var pos = row.insertCell(0);
            var name = row.insertCell(1);
            var salary = row.insertCell(2);
            var team = row.insertCell(3);
            var opp = row.insertCell(4);
            var id = row.insertCell(5);
            var mins = row.insertCell(6);
            var proj = row.insertCell(7);
            var value = row.insertCell(8);
            pos.innerHTML = p['Position'];
            name.innerHTML = p['Name'];
            salary.innerHTML = p['Salary'];
            team.innerHTML = p['TeamAbbrev'];
            opp.innerHTML = opponent;
            id.innerHTML = p['ID'];
            mins.innerHTML =0;
            proj.innerHTML = 0;
            value.innerHTML = 0;

        }
    }
    savetableDataNBA();
    location.reload();
}

function getOpp(gameInfo, team){
    var opp = "";
    var gameInfo = gameInfo.split("@");
    if(gameInfo[0] == team) opp = gameInfo[1];
    else opp = gameInfo[0];
    return opp;
}

// Save contestDataTable data for access at a later date
function savetableDataNBA(){
    var table = document.getElementById("contestDataTable");
    var rows = table.rows;
    var tableDataNBA = [];
    for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var rowData = {};
        var firstRow = rows[0];
        for (var j = 0; j < row.cells.length; j++) {
            let info = firstRow.cells[j].innerHTML;
            rowData[info] = row.cells[j].innerHTML;
            
            
        }

        tableDataNBA.push(rowData);

    }
    localStorage.setItem("tableDataNBA", JSON.stringify(tableDataNBA));
}

// Load contestDataTable data from local storage
function loadtableDataNBA(){
    var table = document.getElementById("contestDataTable");
    var tableDataNBA = JSON.parse(localStorage.getItem("tableDataNBA"));
    var firstRow = table.rows[0];
    for (var i = 0; i < tableDataNBA.length; i++) {
        var row = table.insertRow(-1);
        for (let c of firstRow.cells) {
            let info = c.innerHTML;
            if(info == "Own") continue;
            row.insertCell(-1).innerHTML = tableDataNBA[i][info];

        }
    }
}

function openTab(element){
    var tabs = document.getElementsByClassName("content");
    for(let i = 0; i < tabs.length; i++){
        tabs[i].style.display = "none";
    }
    var tab = document.getElementById(element);
    tab.style.display = "block";
}

$(document).ready(function(){
    loadtableDataNBA();
    getPlayerInfo();
    updateContestDataTable();
    colorRowsBasedOnTeam(document.getElementById('contestDataTable'), 3);
    colorRowsBasedOnTeam(document.getElementById('playerAdjustTable'), 1);
});

// Get info from JSON file
function getInfoFromJSON(file){
    var json = {};
    $.ajax({
        'async': false,
        'global': false,
        'url': file,
        'dataType': "json",
        'success': function (data) {
            json = data;
        }
    });
    return json;
}
// replace accented characters with non-accented characters
function replaceAccented(str){
    const latinRegEx = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
    const comboRegEx = `[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]`;

    /** Used to map Latin Unicode letters to basic Latin letters. */
    const latinUnicodeLetters = {
    // Latin-1 Supplement block.
    '\xc0': 'A',
    '\xc1': 'A',
    '\xc2': 'A',
    '\xc3': 'A',
    '\xc4': 'A',
    '\xc5': 'A',
    '\xe0': 'a',
    '\xe1': 'a',
    '\xe2': 'a',
    '\xe3': 'a',
    '\xe4': 'a',
    '\xe5': 'a',
    '\xc7': 'C',
    '\xe7': 'c',
    '\xd0': 'D',
    '\xf0': 'd',
    '\xc8': 'E',
    '\xc9': 'E',
    '\xca': 'E',
    '\xcb': 'E',
    '\xe8': 'e',
    '\xe9': 'e',
    '\xea': 'e',
    '\xeb': 'e',
    '\xcc': 'I',
    '\xcd': 'I',
    '\xce': 'I',
    '\xcf': 'I',
    '\xec': 'i',
    '\xed': 'i',
    '\xee': 'i',
    '\xef': 'i',
    '\xd1': 'N',
    '\xf1': 'n',
    '\xd2': 'O',
    '\xd3': 'O',
    '\xd4': 'O',
    '\xd5': 'O',
    '\xd6': 'O',
    '\xd8': 'O',
    '\xf2': 'o',
    '\xf3': 'o',
    '\xf4': 'o',
    '\xf5': 'o',
    '\xf6': 'o',
    '\xf8': 'o',
    '\xd9': 'U',
    '\xda': 'U',
    '\xdb': 'U',
    '\xdc': 'U',
    '\xf9': 'u',
    '\xfa': 'u',
    '\xfb': 'u',
    '\xfc': 'u',
    '\xdd': 'Y',
    '\xfd': 'y',
    '\xff': 'y',
    '\xc6': 'Ae',
    '\xe6': 'ae',
    '\xde': 'Th',
    '\xfe': 'th',
    '\xdf': 'ss',
    // Latin Extended-A block.
    '\u0100': 'A',
    '\u0102': 'A',
    '\u0104': 'A',
    '\u0101': 'a',
    '\u0103': 'a',
    '\u0105': 'a',
    '\u0106': 'C',
    '\u0108': 'C',
    '\u010a': 'C',
    '\u010c': 'C',
    '\u0107': 'c',
    '\u0109': 'c',
    '\u010b': 'c',
    '\u010d': 'c',
    '\u010e': 'D',
    '\u0110': 'D',
    '\u010f': 'd',
    '\u0111': 'd',
    '\u0112': 'E',
    '\u0114': 'E',
    '\u0116': 'E',
    '\u0118': 'E',
    '\u011a': 'E',
    '\u0113': 'e',
    '\u0115': 'e',
    '\u0117': 'e',
    '\u0119': 'e',
    '\u011b': 'e',
    '\u011c': 'G',
    '\u011e': 'G',
    '\u0120': 'G',
    '\u0122': 'G',
    '\u011d': 'g',
    '\u011f': 'g',
    '\u0121': 'g',
    '\u0123': 'g',
    '\u0124': 'H',
    '\u0126': 'H',
    '\u0125': 'h',
    '\u0127': 'h',
    '\u0128': 'I',
    '\u012a': 'I',
    '\u012c': 'I',
    '\u012e': 'I',
    '\u0130': 'I',
    '\u0129': 'i',
    '\u012b': 'i',
    '\u012d': 'i',
    '\u012f': 'i',
    '\u0131': 'i',
    '\u0134': 'J',
    '\u0135': 'j',
    '\u0136': 'K',
    '\u0137': 'k',
    '\u0138': 'k',
    '\u0139': 'L',
    '\u013b': 'L',
    '\u013d': 'L',
    '\u013f': 'L',
    '\u0141': 'L',
    '\u013a': 'l',
    '\u013c': 'l',
    '\u013e': 'l',
    '\u0140': 'l',
    '\u0142': 'l',
    '\u0143': 'N',
    '\u0145': 'N',
    '\u0147': 'N',
    '\u014a': 'N',
    '\u0144': 'n',
    '\u0146': 'n',
    '\u0148': 'n',
    '\u014b': 'n',
    '\u014c': 'O',
    '\u014e': 'O',
    '\u0150': 'O',
    '\u014d': 'o',
    '\u014f': 'o',
    '\u0151': 'o',
    '\u0154': 'R',
    '\u0156': 'R',
    '\u0158': 'R',
    '\u0155': 'r',
    '\u0157': 'r',
    '\u0159': 'r',
    '\u015a': 'S',
    '\u015c': 'S',
    '\u015e': 'S',
    '\u0160': 'S',
    '\u015b': 's',
    '\u015d': 's',
    '\u015f': 's',
    '\u0161': 's',
    '\u0162': 'T',
    '\u0164': 'T',
    '\u0166': 'T',
    '\u0163': 't',
    '\u0165': 't',
    '\u0167': 't',
    '\u0168': 'U',
    '\u016a': 'U',
    '\u016c': 'U',
    '\u016e': 'U',
    '\u0170': 'U',
    '\u0172': 'U',
    '\u0169': 'u',
    '\u016b': 'u',
    '\u016d': 'u',
    '\u016f': 'u',
    '\u0171': 'u',
    '\u0173': 'u',
    '\u0174': 'W',
    '\u0175': 'w',
    '\u0176': 'Y',
    '\u0177': 'y',
    '\u0178': 'Y',
    '\u0179': 'Z',
    '\u017b': 'Z',
    '\u017d': 'Z',
    '\u017a': 'z',
    '\u017c': 'z',
    '\u017e': 'z',
    '\u0132': 'IJ',
    '\u0133': 'ij',
    '\u0152': 'Oe',
    '\u0153': 'oe',
    '\u0149': "'n",
    '\u017f': 's',
    };

    const basePropertyOf = (object) => (key) => object[key];
    const characterMap = basePropertyOf(latinUnicodeLetters);
        
    if(str && typeof str === 'string'){
        return str.replace(latinRegEx, characterMap).normalize('NFD').replace(new RegExp(comboRegEx, 'g'), '');
    }
}

// Get player info from JSON file
function getPlayerInfo(){
    var playerdefaults = getInfoFromJSON("season_stats.json");
    var json = {};
    for(let p in playerdefaults){
        let name = replaceAccented(playerdefaults[p]['Player']);
        let DKFPs = Number(playerdefaults[p]['FG'])*2 + Number(playerdefaults[p]['3P'])*1.5 + Number(playerdefaults[p]['FT']) + Number(playerdefaults[p]['TRB'])*1.2 + Number(playerdefaults[p]['AST'])*1.5 + Number(playerdefaults[p]['STL'])*3 + Number(playerdefaults[p]['BLK'])*3 - Number(playerdefaults[p]['TOV'])*1;
        let DKFPsPerMin = DKFPs/Number(playerdefaults[p]['MP']);
        let MinsPerGame = Number(playerdefaults[p]['MP'])/Number(playerdefaults[p]['G']);
        json[name] = {'DKFPsPerMin': DKFPsPerMin, 'MinsPerGame': MinsPerGame};
    }
    var minutesProjection = getDataFromLastStats("MIN");

    for(let p in minutesProjection){
        if(p in json) minutesProjection[p] = 0.7*json[p]['MinsPerGame'] + 0.3*Number(minutesProjection[p].substring(0,2)); else minutesProjection[p] = Number(minutesProjection[p].substring(0,2));
    }
    // console.log(minutesProjection);
    // console.log(json);
    var teams = [];
    // add this info plus team to playerAdjust table; make FPs/Minute a range between 0 and 2 with step of 0.1; make minutes a range between 0 and 48 with step of 1, make Proj a text that updates to fps/minute * minutes
    var table = document.getElementById("playerAdjustTable");
    var contestDataTable = document.getElementById("contestDataTable");
    var rows = contestDataTable.rows;
    for(let r of rows){
        if(r.rowIndex == 0) continue;
        var row = table.insertRow(-1);
        var name = row.insertCell(0);
        var team = row.insertCell(1);
        var fps = row.insertCell(2);
        var mins = row.insertCell(3);
        var proj = row.insertCell(4);
        var injured = row.insertCell(5);

        var player = r.cells[1].innerHTML;
        if(localStorage.savedPlayerDataNBA){
            var playerData = JSON.parse(localStorage.savedPlayerDataNBA);
            if(player in playerData){
                var ppm = Number(playerData[player]['DKFPsPerMin']).toFixed(2);
                if(player in minutesProjection) var mpg = minutesProjection[player].toFixed(0); else var mpg = 0;
            }else if(player in json) {
                var ppm = json[player]['DKFPsPerMin'].toFixed(2);
                if(player in minutesProjection) var mpg = minutesProjection[player].toFixed(0); else var mpg = 0;
            }else{
                var ppm = 0;
                if(player in minutesProjection) var mpg = minutesProjection[player].toFixed(0); else var mpg = 0;
            }

        }else if(player in json) {
            var ppm = json[player]['DKFPsPerMin'].toFixed(2);
            if(player in minutesProjection) var mpg = minutesProjection[player].toFixed(0); else var mpg = 0;
        }else{
            var ppm = 0;
            if(player in minutesProjection) var mpg = minutesProjection[player].toFixed(0); else var mpg = 0;
        }

        name.innerHTML = r.cells[1].innerHTML;
        team.innerHTML = r.cells[3].innerHTML;
        fps.innerHTML = '<text style="width:20%">'+ppm+'</text><input style="width:80%" type="range" value='+ppm+' min="0" max="2" step="0.01" onchange="updateProj(this)">';
        fps.setAttribute('origproj', ppm);
        mins.innerHTML = '<text style="width:20%">'+mpg+'</text><input  style="width:80%"type="range" value='+mpg+' min="0" max="48" step="0.5" onchange="updateProj(this)">';
        mins.setAttribute('origmins', mpg);
        proj.innerHTML = (ppm * mpg).toFixed(1);
        injured.innerHTML = '<button class="healthy" onclick="toggleInjured(this)">Healthy</button>';
        if(!teams.includes(r.cells[3].innerHTML)) teams.push(r.cells[3].innerHTML);
    }
    // Add teams to teamSelect
    var teamSelect = document.getElementById("teamSelect");
    for(let t of teams){
        var option = document.createElement("option");
        option.text = t;
        option.value = t;
        teamSelect.add(option);
    }

    team240();

}

async function team240(){

    let promise = new Promise((resolve) => {
    var table = document.getElementById("playerAdjustTable");
    // Ensuring team minutes add up to 240 (give or take rounding errors)
    var teamMins = {};
    var teamProj = {};
    var teamNewProj = {};
    var teamNumOut = {};
    for(let r of table.rows){
        if(r.rowIndex == 0) continue;
        if(r.cells[1].innerHTML in teamMins) teamMins[r.cells[1].innerHTML] += productOfAttributes(r.cells[3]); else teamMins[r.cells[1].innerHTML] = productOfAttributes(r.cells[3]);
        if(r.cells[1].innerHTML in teamProj) teamProj[r.cells[1].innerHTML] += Number(r.cells[2].getAttribute('origproj'))*Number(r.cells[3].getAttribute('origmins')); else teamProj[r.cells[1].innerHTML] = Number(r.cells[2].getAttribute('origproj'))*Number(r.cells[3].getAttribute('origmins'));
        if(r.cells[1].innerHTML in teamNewProj) teamNewProj[r.cells[1].innerHTML] += productOfAttributes(r.cells[2])*productOfAttributes(r.cells[3]); else teamNewProj[r.cells[1].innerHTML] = productOfAttributes(r.cells[2])*productOfAttributes(r.cells[3]);
        if(r.cells[1].innerHTML in teamNumOut && r.cells[5].getElementsByTagName('button')[0].innerHTML == "Injured") teamNumOut[r.cells[1].innerHTML] += 1; else teamNumOut[r.cells[1].innerHTML] = 1;
    }
    

    for(let r of table.rows){
        if(r.rowIndex == 0) continue;
        let teamMult = 240/Number(teamMins[r.cells[1].innerHTML]);
        let projMult = teamProj[r.cells[1].innerHTML]/teamNewProj[r.cells[1].innerHTML]*(1-0.03*teamNumOut[r.cells[1].innerHTML]);

        r.cells[3].getElementsByTagName("input")[0].value = (productOfAttributes(r.cells[3])*teamMult).toFixed(0);
        r.cells[2].getElementsByTagName("input")[0].value = (productOfAttributes(r.cells[2])*projMult).toFixed(2);
    }
    resolve();});
    promise.then(() => {
        var table = document.getElementById("playerAdjustTable");
        for(let r of table.rows){
            if(r.rowIndex == 0) continue;
            updateProj(r.cells[3].getElementsByTagName("input")[0]);
            updateProj(r.cells[2].getElementsByTagName("input")[0]);
        }   
    });
}

function getDataFromLastStats(stat){
    var json = getInfoFromJSON("player_stats.json");
    console.log(Object.keys(json).length);
    var data = {};
    for(let p of json){
        if(stat in p){
            let name = p["PLAYER_NAME"];
            let val = p[stat];
            if(val == null) val = "0.0";
            data[name] = val;
        }
    }
    return data;
}

function filterByTeam(select, element){
    var team = select.value;
    var table = document.getElementById(element);
    var rows = table.rows;
    var fpsmin = 0;
    var mins = 0;
    var proj = 0;
    for(let r of rows){
        if(r.rowIndex == 0) continue;
        if(r.cells[1].innerHTML == team || team == "All"){ 
            r.style.display = "table-row";
            fpsmin += Number(r.cells[2].getElementsByTagName("input")[0].value);
            mins += Number(r.cells[3].getElementsByTagName("input")[0].value);
            proj += Number(r.cells[4].innerHTML);
        }
        else r.style.display = "none";
    }
    fillTeamSummary(team, fpsmin, mins, proj);
}


function fillTeamSummary(team, fpsmin, mins, proj){
    var teamSummary = document.getElementById("teamSummary");
    if(teamSummary.rows.length == 1) teamSummary.insertRow(-1);
    teamSummary.rows[1].innerHTML = "";
    var row = teamSummary.rows[1];
    var t = row.insertCell(0);
    var f = row.insertCell(1);
    var m = row.insertCell(2);
    var p = row.insertCell(3);
    t.innerHTML = team;
    f.innerHTML = fpsmin.toFixed(2);
    m.innerHTML = mins.toFixed(1);
    p.innerHTML = proj.toFixed(1);
}

function updateProj(element){
    var row = element.parentNode.parentNode;
    var text = element.previousElementSibling;
    text.innerHTML = element.value;
    var fps = row.cells[2].getElementsByTagName("input")[0].value;
    var mins = row.cells[3].getElementsByTagName("input")[0].value;
    var isInjured = row.cells[5].getElementsByTagName("button")[0].innerHTML == "Injured";
    row.cells[4].innerHTML = (Number(fps) * Number(mins)).toFixed(1);

    var name = row.cells[0].innerHTML;
    if(localStorage.savedPlayerDataNBA){
        var playerData = JSON.parse(localStorage.savedPlayerDataNBA);
        playerData[name] = {'DKFPsPerMin': fps, 'MinsPerGame': mins, 'Injured': isInjured};
        localStorage.savedPlayerDataNBA = JSON.stringify(playerData);
    } else{
        var playerData = {};
        playerData[name] = {'DKFPsPerMin': fps, 'MinsPerGame': mins, 'Injured': isInjured};
        localStorage.savedPlayerDataNBA = JSON.stringify(playerData);
    }
    updateContestDataTable();
    filterByTeam(document.getElementById("teamSelect"), "playerAdjustTable");
}

function updateContestDataTable(){
    var table = document.getElementById("contestDataTable");
    var rows = table.rows;
    var adjustPlayers = document.getElementById("playerAdjustTable");
    var adjustRows = adjustPlayers.rows;

    for(let i = 1; i < rows.length; i++){
        rows[i].cells[6].innerHTML = adjustRows[i].cells[3].getElementsByTagName("input")[0].value;
        rows[i].cells[7].innerHTML = adjustRows[i].cells[4].innerHTML;
        rows[i].cells[8].innerHTML = (Number(adjustRows[i].cells[4].innerHTML)/Number(rows[i].cells[2].innerHTML)*1000).toFixed(1);
    }
}

async function buildLineups(){
    var lineupsToBuild = document.getElementById("lineupsToBuild").value;
    
    for(let i = 0; i < lineupsToBuild; i++){
        
        let promise = new Promise((resolve) => {
            var table = document.getElementById("contestDataTable");
            var rows = table.rows;
            var teams = [];

            var players = [];
            // get objects of all players from table and add to players
            // objects should have name as key and all other row info as values
            for(let i = 1; i < rows.length; i++){
                var player = {};
                for(let j = 0; j < rows[i].cells.length; j++){
                    let info = rows[0].cells[j].innerHTML;
                    player[info] = rows[i].cells[j].innerHTML;
                }
                if(player['Projected'] < 10) continue;
                // Add position to player object with value 1
                if(player.Position.includes("PG")){ 
                    player['PG'] = 1;
                    player['G'] = 1;
                }
                if(player.Position.includes("SG")){ 
                    player['SG'] = 1;
                    player['G'] = 1;
                }
                if(player.Position.includes("SF")){ 
                    player['SF'] = 1;
                    player['F'] = 1;
                }
                if(player.Position.includes("PF")){ 
                    player['PF'] = 1;
                    player['F'] = 1;
                }
                if(player.Position.includes("C")){ 
                    player['C'] = 1;
                }
                player['UTIL'] = 1;
                player[player.Team] = 1;
                
                if(!player.Team in teams){ 
                    teams[player.Team] = Math.random();
                    teams[player.Opponent] = teams[player.Team];
                }

                player = randomizeProjection(player, teams);
                players[player.Name] = player;
            }
            resolve(players);
        });

        promise.then((players) => {
        // solve for max projection with constraints
            require(['solver'], function(solver){
                var teams = [];
                var opponents = {};
                for(let p in players){
                    if(!players[p].Team in teams) {
                        teams.push(players[p].Team);
                        opponents[players[p].Team] = players[p].Opponent;
                    }
                    players[p][alphabetize(players[p].Team, players[p].Opponent)] = 1;
                }
                var model = {
                    "optimize": "Projected",
                    "opType": "max",
                    "constraints": {
                        "PG": {"max": 3},
                        "SG": {"max": 3},
                        "SF": {"max": 3},
                        "PF": {"max": 3},
                        "C": {"max": 2},
                        "G": {"min": 4},
                        "F": {"min": 4},
                        "UTIL": {"equal": 8},
                        "Salary": {"max": 50000}
                    },
                    "variables": players,
                    "binaries": players
                };

                for(let t of teams){
                    model.constraints[t] = {"max": 4};
                    let game = alphabetize(t, opponents[t]);
                    model.constraints[game] = {"max": 7};
                }
                
                var result = solver.Solve(model);
                console.log(result);
                addLineupToTable(result, players);
            }); 
        });
    }
}

// Alphabetize two teams into one string
function alphabetize(team1, team2){
    if(team1 < team2) return team1 + team2;
    else return team2 + team1;
}

function addLineupToTable(result, players){
    var table = document.getElementById("lineupTable");
    var row = table.insertRow(-1);

    var lineupPlayers = [];
    for(let p in result){
        if(players[p] != undefined) lineupPlayers.push(players[p]);
    }
    var totalSalary = 0;
    var totalProj = 0;

    // randomize lineupPlayers order and finalize when order matches PG, SG, SF, PF, C, G, F, UTIL
    
    var orderIsCorrect = false;
    var beginLoop = Date.now();
    while(!orderIsCorrect){
        orderIsCorrect = checkOrder(lineupPlayers);
        if(!orderIsCorrect) lineupPlayers = shuffle(lineupPlayers);
        if(Date.now() - beginLoop > 1000) break;
    }
    if(!orderIsCorrect){
        table.deleteRow(row.rowIndex);
        console.log("Could not find valid lineup");
        return;
    }
    for(let p of lineupPlayers){
        let c = row.insertCell(-1)
        c.innerHTML = p.Name + "<br>" + p.ID + "<br>" + p.Salary + "<br>" + p.Team;
        c.style.backgroundColor = getTeamColor(p.Team);
        c.style.color = getTeamSecondaryColor(p.Team);
        totalSalary += Number(p.Salary);
        totalProj += Number(p.Projected);
    }
    let s = row.insertCell(-1)
    s.innerHTML = totalSalary;
    s.backgroundColor = colorByScale(48500, 50000, totalSalary);
    let p = row.insertCell(-1)
    p.innerHTML = totalProj.toFixed(1);
    p.backgroundColor = colorByScale(200, 400, totalProj);
    document.getElementById('lineupsBuilt').innerHTML = Number(document.getElementById('lineupsBuilt').innerHTML) + 1;
}

function checkOrder(lineup){
    var order = ["PG", "SG", "SF", "PF", "C", "G", "F"];
    for(let i = 0; i < order.length; i++){
        if(!lineup[i].Position.includes(order[i])) return false;
    }
    return true;
}

// Randomize the order of an array
function shuffle(array) {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
}

function randomizeProjection(p, teams){
    var teamFlatness = teams[p.Team] > 0.5;
    var mins = Number(p.Minutes);
    var proj = Number(p.Projected);
    var ppm = proj/mins;
    var minsRand = (Math.random() + Math.random() + Math.random() )* 14/3 - 7;
    var ppmRand = (Math.random() + Math.random() + Math.random() )* 0.24/3 - 0.12;
    var minsNew = mins + minsRand;
    if(teamFlatness && mins > 0) minsNew = (8*minsNew + 80)/9;
    var ppmNew = ppm + ppmRand;
    var projNew = minsNew * ppmNew;
    if(projNew < 0) projNew = 0;
    p.Projected = projNew.toFixed(1);
    return p;
}

function updateOwnership(){
    var lineupTable = document.getElementById("lineupTable");
    var ownershipTable = document.getElementById("ownershipTable");
    var poolSize = document.getElementById("poolSize");

    while(ownershipTable.rows.length > 1){
        ownershipTable.deleteRow(1);
    }
    poolSize.innerHTML = 0;

    var rows = lineupTable.rows;
    var ownership = {};
    for(let i = 1; i < rows.length; i++){
        var row = rows[i];
        var players = row.cells;
        for(let p of players){
            if(p.cellIndex >= 8) continue;
            let name = p.innerHTML.split("<br>")[0];
            if(name in ownership) ownership[name] += 1;
            else{ 
                ownership[name] = 1;
                poolSize.innerHTML = Number(poolSize.innerHTML) + 1;
            }
        }
    }
    for(let p in ownership){
        let row = ownershipTable.insertRow(-1);
        let name = row.insertCell(0);
        let own = row.insertCell(1);
        name.innerHTML = p;
        own.innerHTML = (ownership[p]/(rows.length-1)*100).toFixed(1);
    }
    sortTable(ownershipTable, 1);
}


function sortTable(table, column){
    var rows, switching, i, x, y, shouldSwitch;
    switching = true;
    while(switching){
        switching = false;
        rows = table.rows;
        for(i = 1; i < (rows.length - 1); i++){
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("td")[column];
            y = rows[i+1].getElementsByTagName("td")[column];
            if(Number(x.innerHTML) < Number(y.innerHTML)) shouldSwitch = true;
            if(shouldSwitch){
                rows[i].parentNode.insertBefore(rows[i+1], rows[i]);
                switching = true;
            }
        }
    }
}

function downloadLineups(){
    var lineups = document.getElementById("lineupTable").rows;
    var csv = "data:text/csv;charset=utf-8,";
    csv += "PG,SG,SF,PF,C,G,F,UTIL\n";
    for(let l of lineups){
        if(l.rowIndex == 0) continue;
        var row = [];
        for(let c of l.cells){
            if(c.cellIndex >= 8) continue;
            csv += c.innerHTML.split("<br>")[1]
            if(c.cellIndex < 7) csv += ",";
        }
        csv += "\n";    
    }
    var encodedUri = encodeURI(csv);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "lineups.csv");
    document.body.appendChild(link);
    link.click();
}

function downloadEditedLineups(){
    var lineups = document.getElementById("lineupTable").rows;
    var csv = "data:text/csv;charset=utf-8,";
    var previousLineups = JSON.parse(DKEntries);

    for(let l of lineups){
        if(l.rowIndex == 0) continue;
        var row = [];
        for(let c of l.cells){
            if(c.cellIndex >= 8) continue;
            row.push(c.innerHTML.split("<br>")[1]);
        }

        var index = l.rowIndex;
        if(index > previousLineups.length) index = previousLineups.length;
        for(let i = 0; i < row.length; i++){

            previousLineups[index][i+4] = row[i];
        }
    }
    for(let l of previousLineups){
        csv += l.join(",") + "\n";
    }
    //csv += previousLineups.join("\n");
    var encodedUri = encodeURI(csv);

    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "lineups.csv");
    document.body.appendChild(link);
    link.click();
}

var DKEntries = "";

function handleLineupscsv(){
    var csv = document.getElementById("editcsv").files[0];
    var reader = new FileReader();
    // save csv to storage as JSON
    reader.onload = function(e){
        var csv = e.target.result;
        var lines = csv.split("\n");
        var result = [];
        var headers = lines[0].split(",");
        for(let i = 0; i < lines.length; i++){
            var obj = [];
            var currentline = lines[i].split(",");
            for(let j = 0; j < headers.length; j++){
                obj[j] = currentline[j];
            }
            result.push(obj);
        }
        //localStorage.DKEntries = JSON.stringify(result);
        //return result;
        //return(JSON.stringify(result));
        //location.reload();
        DKEntries = JSON.stringify(result);
    }
    reader.readAsText(csv);

}

function colorRowsBasedOnTeam(table, column){
    var rows = table.rows;
    for(let i = 1; i < rows.length; i++){
        let row = rows[i];
        let team = row.cells[column].innerHTML;
        row.style.backgroundColor = getTeamColor(team);
        row.style.color = getTeamSecondaryColor(team);
        row.style.fontWeight = "400";
    }
}

function getTeamColor(team){
    switch(team){
        case "ATL": return "#E03A3E";
        case "BKN": return "#000000";
        case "BOS": return "#007A33";
        case "CHA": return "#1D1160";
        case "CHI": return "#CE1141";
        case "CLE": return "#860038";
        case "DAL": return "#00538C";
        case "DEN": return "#0E2240";
        case "DET": return "#C8102E";
        case "GSW": return "#006BB6";
        case "HOU": return "#CE1141";
        case "IND": return "#002D62";
        case "LAC": return "#C8102E";
        case "LAL": return "#552583";
        case "MEM": return "#5D76A9";
        case "MIA": return "#98002E";
        case "MIL": return "#00471B";
        case "MIN": return "#0C2340";
        case "NOP": return "#0C2340";
        case "NYK": return "#006BB6";
        case "OKC": return "#007AC1";
        case "ORL": return "#0077C0";
        case "PHI": return "#006BB6";
        case "PHX": return "#1D1160";
        case "POR": return "#E03A3E";
        case "SAC": return "#5A2D81";
        case "SAS": return "#C4CED4";
        case "TOR": return "#CE1141";
        case "UTA": return "#002B5C";
        case "WAS": return "#002B5C";
        default: return "#000000";
    }
}

function getTeamSecondaryColor(team){
    switch(team){
        case "SAS": return "#000000";
        default: return "#FFFFFF";
    }
}

function resetPlayerAdjustTable(){
    localStorage.removeItem("savedPlayerDataNBA");
    location.reload();
}

async function toggleInjured(btn){

    let promise = new Promise((resolve) => {
    var player = btn.parentNode.parentNode.cells[0].innerHTML;
    var team = btn.parentNode.parentNode.cells[1].innerHTML;
    btn.parentNode.parentNode.cells[2].getElementsByTagName("input")[0].value = 0;
    btn.parentNode.parentNode.cells[3].getElementsByTagName("input")[0].value = 0;
    resolve([player, team]);
    });
    promise.then((values) => {
        let player = values[0];
        let team = values[1];
        if(btn.innerHTML == "Healthy"){
            btn.innerHTML = "Injured";
            btn.className = "injured";
            applyInjury(player, team);
        } else{
            btn.innerHTML = "Healthy";
            btn.className = "healthy";
            removeInjury(player, team);
        }
    });
}


async function applyInjury(player, team){

    var att = playerNameAsAttribute(player);
    var playerAdjustTable = document.getElementById("playerAdjustTable");
    var adjustRows = playerAdjustTable.rows;
    var promises = [];
        for(let r of adjustRows){
            promises.push(new Promise((resolve) => {

            if(r.rowIndex == 0) resolve();
            if(r.cells[1].innerHTML == team){
                let promise = new Promise((resolve) => {
                    let minboost = 0.05; 
                    let projboost = 0.03;
                    startproj = productOfAttributes(r.cells[2]);
                    startmins = productOfAttributes(r.cells[3]);
                    if(r.cells[0].innerHTML == player){
                        projboost = -1;
                        minboost = -1;
                    }else{
                        if(startmins > 35) minboost = -.09; else if(startmins > 30) minboost = -.07; else if(startmins > 26) minboost = -0.05; else if(startmins > 18) minboost = -0.04; else if(startmins > 10) minboost = 0.15; else if(startmins > 5) minboost = 0.25; else minboost = 0.9;
                        if(startproj > 1.2) projboost = -0.05; else if(startproj > 0.95) projboost = 0; else if(startproj > .5) projboost = 0.01; 
                    }                          
                    let newproj = productOfAttributes(r.cells[2])*(1+projboost);
                    let newmins = productOfAttributes(r.cells[3])*(1+minboost);
                    if(r.cells[5].getElementsByTagName("button")[0].innerHTML == "Injured"){
                        newproj = 0;
                        newmins = 0;
                    }
                    resolve([newproj, newmins, projboost, minboost]);
                }
                );
                promise.then((values) => {
                    console.log(att);
                    r.cells[2].setAttribute(att, 1+values[2]);
                    r.cells[3].setAttribute(att, 1+values[3]);

                    r.cells[2].getElementsByTagName("input")[0].value = values[0];
                    r.cells[3].getElementsByTagName("input")[0].value = values[1];
                    return "done";
                }).then((str) => {
                    console.log(str);
                    updateProj(r.cells[2].getElementsByTagName("input")[0]);
                    updateProj(r.cells[3].getElementsByTagName("input")[0]);
                });
            }
            resolve();
        }));
        }

    Promise.all(promises).then(() => {
        team240();
    });
}


function productOfAttributes(cell){
    var attributes = cell.getAttributeNames();
    var product = 1;
    for(let a of attributes){
        let att = cell.getAttribute(a);
        product *= Number(att);
    }
    return product;
}

function playerNameAsAttribute(player){
    var name = player.replace(/[^a-zA-Z ]/g, "");
    name = name.replace(/\s/g, "");
    return name;
}

async function removeInjury(player, team){
    var att = playerNameAsAttribute(player);
    var playerAdjustTable = document.getElementById("playerAdjustTable");
    var adjustRows = playerAdjustTable.rows;
    let loopPromise = new Promise((resolve) => {
        for(let r of adjustRows){
            if(r.rowIndex == 0) continue;
            if(r.cells[1].innerHTML == team){
                if(r.cells[0].innerHTML == player){
                    let promise = new Promise((resolve) => {
                        let proj = productOfAttributes(r.cells[2]);
                        let min = productOfAttributes(r.cells[3]);
                        resolve([proj, min]);
                    });
                    promise.then((values) => {
                        r.cells[2].getElementsByTagName("input")[0].value = values[0];
                        r.cells[3].getElementsByTagName("input")[0].value = values[1];
                        return "done";
                    }).then((str) => {
                        console.log(str);
                        updateProj(r.cells[2].getElementsByTagName("input")[0]);
                        updateProj(r.cells[3].getElementsByTagName("input")[0]);
                    });
                }else{
                    let promise = new Promise((resolve) => {
                        r.cells[2].removeAttribute(att);
                        r.cells[3].removeAttribute(att);
                        resolve();
                    });
                    promise.then(() => {
                        let proj = productOfAttributes(r.cells[2]);
                        let min = productOfAttributes(r.cells[3]);
                        return([proj, min]);
                    }).then((values) => {
                        r.cells[2].getElementsByTagName("input")[0].value = values[0];
                        r.cells[3].getElementsByTagName("input")[0].value = values[1];
                        return "done";
                    }).then((str) => {
                        console.log(str);
                        updateProj(r.cells[2].getElementsByTagName("input")[0]);
                        updateProj(r.cells[3].getElementsByTagName("input")[0]);
                    });
                }
            }
        }
        resolve();
    }
    );
    loopPromise.then(() => {
        team240();
    });
}

function clearLineups(){
    var table = document.getElementById("lineupTable");
    var rows = table.rows;
    for(let i = rows.length-1; i > 0; i--){
        table.deleteRow(i);
    }
    document.getElementById('lineupsBuilt').innerHTML = 0;
}

function colorByScale(min, max, value){
    if(value < min) value = min;
    if(value > max) value = max;
    
    var percent = (value - min)/(max - min);
    var r, g, b = 0;
    if(percent < 0.5){
        r = 255;
        g = Math.round(510 * percent);
    }
    else{
        g = 255;
        r = Math.round(510 * (1 - percent));
    }
    var h = r * 0x10000 + g * 0x100 + b * 0x1;
    return '#' + ('000000' + h.toString(16)).slice(-6);
}