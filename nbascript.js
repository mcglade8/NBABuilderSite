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
        //DKSalaries = result;//JSON.stringify(result);
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
    localStorage.removeItem("tableData");
    localStorage.removeItem("DKSalaries");
}

async function getContestData(DKSalaries){
    var contestData = [];
    localStorage.DKSalaries = JSON.stringify(DKSalaries);
    // Add contest info from uploaded file to contestData
    // var contestDate = document.getElementById("contestDate").value;
    // var contestName = document.getElementById("contestName").value;
    for(let i of DKSalaries){
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
    saveTableData();
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
function saveTableData(){
    var table = document.getElementById("contestDataTable");
    var rows = table.rows;
    var tableData = [];
    for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var rowData = {};
        var firstRow = rows[0];
        for (var j = 0; j < row.cells.length; j++) {
            let info = firstRow.cells[j].innerHTML;
            rowData[info] = row.cells[j].innerHTML;
            
            
        }

        tableData.push(rowData);

    }
    localStorage.setItem("tableData", JSON.stringify(tableData));
}

// Load contestDataTable data from local storage
function loadTableData(){
    var table = document.getElementById("contestDataTable");
    var tableData = JSON.parse(localStorage.getItem("tableData"));
    var firstRow = table.rows[0];
    for (var i = 0; i < tableData.length; i++) {
        var row = table.insertRow(-1);
        for (let c of firstRow.cells) {
            let info = c.innerHTML;
            if(info == "Own") continue;
            row.insertCell(-1).innerHTML = tableData[i][info];

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
    loadTableData();
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

// Get player info from JSON file
function getPlayerInfo(){
    var json = getInfoFromJSON("playerdefaults.json");
    var minutesProjection = getInfoFromJSON("minutesProjection.json");
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

        var player = r.cells[1].innerHTML;
        if(localStorage.savedPlayerDataNBA){
            var playerData = JSON.parse(localStorage.savedPlayerDataNBA);
            if(player in playerData){
                var ppm = Number(playerData[player]['DKFPsPerMin']).toFixed(2);
                if(player in minutesProjection) var mpg = Number(minutesProjection[player]); else var mpg = Number(playerData[player]['MinsPerGame']).toFixed(1);
            }else if(player in json) {
                var ppm = json[player]['DKFPsPerMin'].toFixed(2);
                if(player in minutesProjection) var mpg = Number(minutesProjection[player]); else var mpg = json[player]['MinsPerGame'].toFixed(1);
            }else{
                var ppm = 0.7;
                if(player in minutesProjection) var mpg = Number(minutesProjection[player]); else var mpg = 5;
            }
        }else if(player in json) {
            var ppm = json[player]['DKFPsPerMin'].toFixed(2);
            if(player in minutesProjection) var mpg = Number(minutesProjection[player]); else var mpg = json[player]['MinsPerGame'].toFixed(1);
        }else{
            var ppm = 0.7;
            if(player in minutesProjection) var mpg = Number(minutesProjection[player]); else var mpg = 5;
        }

        name.innerHTML = r.cells[1].innerHTML;
        team.innerHTML = r.cells[3].innerHTML;
        fps.innerHTML = '<text style="width:20%">'+ppm+'</text><input style="width:80%" type="range" value='+ppm+' min="0" max="2" step="0.01" onchange="updateProj(this)">';
        mins.innerHTML = '<text style="width:20%">'+mpg+'</text><input  style="width:80%"type="range" value='+mpg+' min="0" max="48" step="0.5" onchange="updateProj(this)">';
        proj.innerHTML = (ppm * mpg).toFixed(1);

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
    row.cells[4].innerHTML = (Number(fps) * Number(mins)).toFixed(1);

    var name = row.cells[0].innerHTML;
    if(localStorage.savedPlayerDataNBA){
        var playerData = JSON.parse(localStorage.savedPlayerDataNBA);
        playerData[name] = {'DKFPsPerMin': fps, 'MinsPerGame': mins};
        localStorage.savedPlayerDataNBA = JSON.stringify(playerData);
    } else{
        var playerData = {};
        playerData[name] = {'DKFPsPerMin': fps, 'MinsPerGame': mins};
        localStorage.savedPlayerDataNBA = JSON.stringify(playerData);
    }
    updateContestDataTable();
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

            var players = [];
            // get objects of all players from table and add to players
            // objects should have name as key and all other row info as values
            for(let i = 1; i < rows.length; i++){
                var player = {};
                for(let j = 0; j < rows[i].cells.length; j++){
                    let info = rows[0].cells[j].innerHTML;
                    player[info] = rows[i].cells[j].innerHTML;
                }
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
                player = randomizeProjection(player);
                players[player.Name] = player;
            }
            resolve(players);
        });

        promise.then((players) => {
        // solve for max projection with constraints
            require(['solver'], function(solver){
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
                var result = solver.Solve(model);
                console.log(result);
                addLineupToTable(result, players);
            }); 
        });
    }
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
    while(!orderIsCorrect){
        orderIsCorrect = checkOrder(lineupPlayers);
        if(!orderIsCorrect) lineupPlayers = shuffle(lineupPlayers);
    }

    for(let p of lineupPlayers){
        row.insertCell(-1).innerHTML = p.Name + "<br>" + p.ID + "<br>" + p.Salary + "<br>" + p.Team;
        totalSalary += Number(p.Salary);
        totalProj += Number(p.Projected);
    }
    row.insertCell(-1).innerHTML = totalSalary;
    row.insertCell(-1).innerHTML = totalProj.toFixed(1);
    
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

function randomizeProjection(p){
    var mins = Number(p.Minutes);
    var proj = Number(p.Projected);
    var ppm = proj/mins;
    var minsRand = (Math.random() + Math.random() + Math.random() )* 14/3 - 7;
    var ppmRand = (Math.random() + Math.random() + Math.random() )* 0.24/3 - 0.12;
    var minsNew = mins + minsRand;
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