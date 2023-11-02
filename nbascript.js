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
    longTermOut();
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

// Get player info from JSON file
function getPlayerInfo(){
    var json = getInfoFromJSON("playerdefaults.json");
    var minutesProjection = getDataFromLastStats("MIN");
    console.log(minutesProjection);
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
                if(player in minutesProjection) var mpg = Number(minutesProjection[player].substring(0,2)); else var mpg = 0;
            }else if(player in json) {
                var ppm = json[player]['DKFPsPerMin'].toFixed(2);
                if(player in minutesProjection) var mpg = Number(minutesProjection[player].substring(0,2)); else var mpg = 0;
            }else{
                var ppm = 0;
                if(player in minutesProjection) var mpg = Number(minutesProjection[player].substring(0,2)); else var mpg = 0;
            }

        }else if(player in json) {
            var ppm = json[player]['DKFPsPerMin'].toFixed(2);
            if(player in minutesProjection) var mpg = Number(minutesProjection[player].substring(0,2)); else var mpg = 0;
        }else{
            var ppm = 0;
            if(player in minutesProjection) var mpg = Number(minutesProjection[player].substring(0,2)); else var mpg = 0;
        }

        name.innerHTML = r.cells[1].innerHTML;
        team.innerHTML = r.cells[3].innerHTML;
        fps.innerHTML = '<text style="width:20%">'+ppm+'</text><input style="width:80%" type="range" value='+ppm+' min="0" max="2" step="0.01" onchange="updateProj(this)">';
        mins.innerHTML = '<text style="width:20%">'+mpg+'</text><input  style="width:80%"type="range" value='+mpg+' min="0" max="48" step="0.5" onchange="updateProj(this)">';
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

}


function getDataFromLastStats(stat){
    var json = getInfoFromJSON("laststats.json");
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

function toggleInjured(btn){
    var player = btn.parentNode.parentNode.cells[0].innerHTML;
    var team = btn.parentNode.parentNode.cells[1].innerHTML;
    if(btn.innerHTML == "Healthy"){
        btn.innerHTML = "Injured";
        btn.className = "injured";
        applyInjury(player, team);
    } else{
        btn.innerHTML = "Healthy";
        btn.className = "healthy";
        removeInjury(player, team);
    }
}

function applyInjury(player, team){
    var injuries = injuryBenefit()[player];
    if(injuries == undefined){
        injuries = {};
    }
    var att = playerNameAsAttribute(player);
    var playerAdjustTable = document.getElementById("playerAdjustTable");
    var adjustRows = playerAdjustTable.rows;
    for(let r of adjustRows){
        if(r.rowIndex == 0) continue;
        if(r.cells[0].innerHTML == player){
            r.cells[2].setAttribute("origProj", r.cells[2].getElementsByTagName("input")[0].value);
            r.cells[2].getElementsByTagName("input")[0].value = 0;
            r.cells[3].setAttribute("origMins", r.cells[3].getElementsByTagName("input")[0].value);
            r.cells[3].getElementsByTagName("input")[0].value = 0;
            updateProj(r.cells[2].getElementsByTagName("input")[0]);
            updateProj(r.cells[3].getElementsByTagName("input")[0]);

        }else if(r.cells[1].innerHTML == team){
            if(injuries[r.cells[0].innerHTML] == undefined){
                injuries[r.cells[0].innerHTML] = {
                    "Minutes": 0.02,
                    "FPPM": 0.05
                }
            }
            let minboost = injuries[r.cells[0].innerHTML]['Minutes'];
            let projboost = injuries[r.cells[0].innerHTML]['FPPM'];
            if(r.cells[2].getElementsByTagName("input")[0].value != 0) r.cells[2].setAttribute("origProj", r.cells[2].getElementsByTagName("input")[0].value);
            r.cells[2].setAttribute(att, projboost)
            r.cells[2].getElementsByTagName("input")[0].value = Number(r.cells[2].getElementsByTagName("input")[0].value) * (1 + projboost);
            if(r.cells[3].getElementsByTagName("input")[0].value != 0) r.cells[3].setAttribute("origMins", r.cells[3].getElementsByTagName("input")[0].value);
            r.cells[3].setAttribute(att, minboost);
            r.cells[3].getElementsByTagName("input")[0].value = Number(r.cells[3].getElementsByTagName("input")[0].value) * (1 + minboost);
            updateProj(r.cells[2].getElementsByTagName("input")[0]);
            updateProj(r.cells[3].getElementsByTagName("input")[0]);

        }
    }
}

function playerNameAsAttribute(player){
    var name = player.replace(/[^a-zA-Z ]/g, "");
    name = name.replace(/\s/g, "");
    return name;
}

function removeInjury(player, team){
    var att = playerNameAsAttribute(player);
    var playerAdjustTable = document.getElementById("playerAdjustTable");
    var adjustRows = playerAdjustTable.rows;
    for(let r of adjustRows){
        if(r.rowIndex == 0) continue;
        if(r.cells[1].innerHTML == team){
            if(r.cells[0].innerHTML == player){
                r.cells[2].getElementsByTagName("input")[0].value = Number(r.cells[2].getAttribute("origProj"));
                r.cells[3].getElementsByTagName("input")[0].value = Number(r.cells[3].getAttribute("origMins"));
                updateProj(r.cells[2].getElementsByTagName("input")[0]);
                updateProj(r.cells[3].getElementsByTagName("input")[0]);
            }else{
                r.cells[2].getElementsByTagName("input")[0].value = r.cells[2].getElementsByTagName("input")[0].value/(1+Number(r.cells[2].getAttribute(att)));
                r.cells[3].getElementsByTagName("input")[0].value = r.cells[3].getElementsByTagName("input")[0].value/(1+Number(r.cells[3].getAttribute(att)));
                updateProj(r.cells[2].getElementsByTagName("input")[0]);
                updateProj(r.cells[3].getElementsByTagName("input")[0]);
            }
        }
    }
}

function clearLineups(){
    var table = document.getElementById("lineupTable");
    var rows = table.rows;
    for(let i = rows.length-1; i > 0; i--){
        table.deleteRow(i);
    }
    document.getElementById('lineupsBuilt').innerHTML = 0;
}

function injuryBenefit(){
    var injuries = {
        "Donovan Mitchell":{
            "Evan Mobley":{
                "Minutes": 0.1,
                "FPPM": 0.05
            },
            "Darius Garland":{
                "Minutes": 0.1,
                "FPPM": 0.12
            },
            "Caris Levert":{
                "Minutes": 0.1,
                "FPPM": 0.05
            }
            
        },
        "Darius Garland":{
            "Evan Mobley":{
                "Minutes": 0.15,
                "FPPM": 0.05
            },
            "Donovan Mitchell":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
            "Caris Levert":{
                "Minutes": 0.2,
                "FPPM": 0.05
            }
        },
        "Devin Booker":{
            "Kevin Durant":{
                "Minutes": 0.15,
                "FPPM": 0.1
            },
            "Nassir Little":{
                "Minutes": 0.13,
                "FPPM": 0.06
            },
            "Grayson Allen":{
                "Minutes": 0.3,
                "FPPM":0.2
            },
            "Eric Gordon":{
                "Minutes": 0.05,
                "FPPM": 0.08
            },
            "Jordan Goodwin":{
                "Minutes": 0.3,
                "FPPM": 0.02
            },
            "Jusuf Nurkic":{
                "Minutes": 0.01,
                "FPPM": 0.05
            }
        },
        "Tyrese Haliburton":{
            "Aaron Nesmith":{
                "Minutes": 0.1,
                "FPPM": 0.2
            },
            "Isaiah Jackson":{
                "Minutes": 0.1,
                "FPPM": 0.05
            },
            "Bennedict Mathurin":{
                "Minutes": 0.1,
                "FPPM": 0.7
            },
            "Myles Turner":{
                "Minutes": 0.1,
                "FPPM": 0.6
            },
            "T.J. McConnell":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
            "Bruce Brown":{
                "Minutes": 0.25,
                "FPPM": 0.05
            },

        },
        "Trae Young":{
            "Dejounte Murray":{
                "Minutes": 0.13,
                "FPPM": 0.07
            },
            "Jalen Johnson":{
                "Minutes": 0.11,
                "FPPM": 0.05
            },
            "Saddiq Bey":{
                "Minutes": 0.14,
                "FPPM": 0.03
            },
            "De'Andre Hunter":{
                "Minutes": 0.08,
                "FPPM": 0.03
            },
        },
        "Spencer Dinwiddie":{
            "Cameron Johnson":{
                "Minutes": 0.1,
                "FPPM": 0.3
            },
            "Dennis Smith Jr.":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
            "Day'Ron Sharpe":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
            "Lonnie Walker IV":{
                "Minutes": 0.15,
                "FPPM": 0.2
            },
            "Dorian Finney-Smith":{
                "Minutes": 0.2,
                "FPPM": 0.1
            },
            "Mikal Bridges":{
                "Minutes": 0.2,
                "FPPM": 0.1
            },
            
        },
        "Dennis Smith Jr.":{
            "Nicolas Claxton":{
                "Minutes": 0.1,
                "FPPM": 0.6
            }
            ,"Spencer Dinwiddie":{
                "Minutes": 0.1,
                "FPPM": 0.2
            },
            "Royce O'Neale":{
                "Minutes": 0.2,
                "FPPM": 0.1
            },
        },
        "Jimmy Butler":{
            "Caleb Martin":{
                "Minutes": 0.1,
                "FPPM": 0.4
            },
            "Dru Smith":{
                "Minutes": 0.15,
                "FPPM": 0.3
            },
            "Duncan Robinson":{
                "Minutes": 0.2,
                "FPPM": 0.01
            },
            "Tyler Herro":{
                "Minutes": 0.3,
                "FPPM": 0.01
            },
            "Kyle Lowry":{
                "Minutes": 0.3,
                "FPPM": 0.01
            },
            "Bam Adebayo":{
                "Minutes": 0.3,
                "FPPM": 0.01
            },
            "Thomas Bryant":{
                "Minutes": 0.3,
                "FPPM": 0.1
            },
            "Jaime Jaquez Jr.":{
                "Minutes": 0.12,
                "FPPM": 0.1
            },

        },
        "Brandon Ingram":{
            "Dyson Daniels":{
                "Minutes": 0.2,
                "FPPM": 0.3
            },
            "CJ McCollum":{
                "Minutes": 0.2,
                "FPPM": 0.1
            },
            "Matt Ryan":{
                "Minutes": 0.15,
                "FPPM": 0.1
            },
            "Zion Williamson":{
                "Minutes": 0.1,
                "FPPM": 0.01
            },
            "Jonas Valanciunas":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
        },
        "Bam Adebayo":{
            "Caleb Martin":{
                "Minutes": 0.1,
                "FPPM": 0.4
            },
            "Dru Smith":{
                "Minutes": 0.15,
                "FPPM": 0.3
            },
            "Duncan Robinson":{
                "Minutes": 0.2,
                "FPPM": 0.01
            },
            "Tyler Herro":{
                "Minutes": 0.3,
                "FPPM": 0.01
            },
            "Kyle Lowry":{
                "Minutes": 0.3,
                "FPPM": 0.01
            },
            "Jimmy Butler":{
                "Minutes": 0.3,
                "FPPM": 0.01
            },
            "Thomas Bryant":{
                "Minutes": 0.01,
                "FPPM": 0.1
            },
            "Jaime Jaquez Jr.":{
                "Minutes": 0.12,
                "FPPM": 0.1
            },
            "Jamal Cain":{
                "Minutes": 0.18,
                "FPPM": 0.2
            }
        },
        "Zach LaVine":{
            "Jevon Carter":{
                "Minutes": 0.2,
                "FPPM": 0.2
            }
            , "Torrey Craig":{
                "Minutes": 0.2,
                "FPPM": 0.2
            }
            , "Patrick Williams":{
                "Minutes": 0.2,
                "FPPM": 0.2
            }
            , "Coby White":{
                "Minutes": 0.2,
                "FPPM": 0.2
            }
            , "DeMar DeRozan":{
                "Minutes": 0.1,
                "FPPM": 0.1
            }
            , "Andre Drummond":{
                "Minutes": 0.1,
                "FPPM": 0.1
            }
            , "Nikola Vucevic":{
                "Minutes": 0.1,
                "FPPM": 0.1
            }

        },
        "Klay Thompson":{
            "Stephen Curry":{
                "Minutes": 0.1,
                "FPPM": 0.2
            }
            , "Jonathan Kuminga":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
            "Gary Payton II":{
                "Minutes": 0.1,
                "FPPM": 0.1
            }
            , "Andrew Wiggins":{
                "Minutes": 0.1,
                "FPPM": 0.01
            }
            , "Trayce Jackson-Davis":{
                "Minutes": 0.1,
                "FPPM": 0.01
            }
            , "Draymond Green":{
                "Minutes": 0.1,
                "FPPM": 0.01
            }
            , "Dario Saric":{
                "Minutes": 0.1,
                "FPPM": 0.01
            }
        },
        "Jalen Duren":{
            "Cade Cunningham":{
                "Minutes": 0.1,
                "FPPM": 0.15
            },
            "Isaiah Stewart":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
            "Marvin Bagley III":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
        }, 
        "Caris LeVert":{
            "Evan Mobley":{
                "Minutes": 0.01,
                "FPPM": 0.05
            },
            "Darius Garland":{
                "Minutes": 0.05,
                "FPPM": 0.1
            },
            "Donovan Mitchell":{
                "Minutes": 0.01,
                "FPPM": 0.1
            }
            , "Dean Wade":{
                "Minutes": 0.2,
                "FPPM": 0.1
            }
            , "Isaac Okoro":{
                "Minutes": 0.2,
                "FPPM": 0.1
            }
            , "Emoni Bates":{
                "Minutes": 0.2,
                "FPPM": 0.3
            }

        }, 
        "Jarrett Allen":{

        }, 
        "Nic Claxton":{
            "Cameron Johnson":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
            "Spencer Dinwiddie":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
            "Dennis Smith Jr.":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
            "Ben Simmons":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
        },
        "Bennedict Mathurin":{
            "Tyrese Haliburton":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
            "Obi Toppin":{
                "Minutes": 0.1,
                "FPPM": 0.15
            },
            "Myles Turner":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
            "T.J. McConnell":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
            "Aaron Nesmith":{
                "Minutes": 0.1,
                "FPPM": 0.1
            }
            , "Jalen Smith":{
                "Minutes": 0.05,
                "FPPM": 0.1
            }
        },
        "Jonathan Kuminga":{
            "Andrew Wiggins":{
                "Minutes": 0.05,
                "FPPM": 0.05
            },
            "Moses Moody":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
        },
        "Cameron Johnson":{
            "Spencer Dinwiddie":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
            "Day'Ron Sharpe":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
            "Mikal Bridges":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
        },
        "Daniel Gafford":{
            "Tyus Jones":{
                "Minutes": 0.15,
                "FPPM": 0.15
            },
            "Kyle Kuzma":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
            "Deni Avdija":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
            "Delon Wright":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
        },
        "Jaden McDaniels":{
            "Rudy Gobert":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
            "Naz Reid":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
            "Kyle Anderson":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
        },
        "Caleb Martin":{
            "Dru Smith":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
            "Tyler Herro":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
        },
        "Jalen Smith":{
            "Andrew Nembhard":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
            "Buddy Hield":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
            "Bruce Brown":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
        },
        "Dario Saric":{
            "Moses Moody":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
            "Andrew Wiggins":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
            "Klay Thompson":{
                "Minutes": 0.1,
                "FPPM": 0.1
            },
        },
        "Rui Hachimura":{
            "Christian Wood":{
                "Minutes": 0.05,
                "FPPM": 0.05
            },
            "Cam Reddish":{
                "Minutes": 0.05,
                "FPPM": 0.05
            },
        },
        "Robert Covington":{

        },
        "Terrance Mann":{

        },
        "Marjon Beauchamp":{

        },
        "Nicolas Batum":{

        },
        "Cam Reddish":{

        },
        "KJ Martin":{
        },
        "Shake Milton":{

        },
        "Marcus Morris Sr.":{
        },
        "Cody Martin":{

        },
        "Kyrie Irving":{
            "Luka Doncic":{
                "Minutes": 0.05,
                "FPPM": 0.05
            },
            "Dante Exum":{
                "Minutes": 0.05,
                "FPPM": 0.05
            },
            "Seth Curry":{
                "Minutes": 0.07,
                "FPPM": 0.05
            },
            "Derrick Jones Jr.":{
                "Minutes": 0.05,
                "FPPM": 0.05
            },
        }

    }
    return injuries;
}

function longTermOut(){
    var out = getInfoFromJSON("longTermInjured.json");
    var playerAdjustTable = document.getElementById("playerAdjustTable");
    var adjustRows = playerAdjustTable.rows;
    for(let r of adjustRows){
        if(r.rowIndex == 0) continue;
        if(out.includes(r.cells[0].innerHTML)){
            r.cells[2].getElementsByTagName("input")[0].value = 0;
            r.cells[3].getElementsByTagName("input")[0].value = 0;
            r.cells[5].getElementsByTagName("button")[0].innerHTML = "Injured";
            r.cells[5].getElementsByTagName("button")[0].className = "injured";

            updateProj(r.cells[2].getElementsByTagName("input")[0]);
            updateProj(r.cells[3].getElementsByTagName("input")[0]);
        }
    }
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