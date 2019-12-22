// GENERATING TABLES
var globalData = {};
var ownedData = {};
var exportTiers = {};
var settings = {};
var totalCounts = {};
var mapsPoolTiers = {};
var mapsOwnedTiers = {};
var selectedSockets = [];
var completedMaps = {};
var ownedMaps = {};
var extID = "acollioegocfhmcnjpohfhnjddbiepgo";
var myToken = "";
var loaded = {};
var currentAction = "query";
var myRoot = document.documentElement;
var allowedMapNames = []; 
var allowedTiers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
var queryInProgress = false;
var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
var isFirefox = typeof InstallTrigger !== 'undefined';
var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
var isIE = /*@cc_on!@*/false || !!document.documentMode;
var isEdge = !isIE && !!window.StyleMedia;
var poeLeagues = ["Metamorph", "Metamorph Hardcore", "Standard", "Hardcore"]
var poeMapSeries = "metamorph"

const copyToClipboard = str => {
	const el = document.createElement('textarea');
	el.value = str;
	el.setAttribute('readonly', '');
	el.style.position = 'absolute';
	el.style.left = '-9999px';
	document.body.appendChild(el);
	el.select();
	document.execCommand('copy');
	document.body.removeChild(el);
};

function toggleTiers(e) {
	$(".table-export input[type='checkbox'").each( function() {
		$(this).prop("checked", !$(this).prop("checked"));
		$(this).change();
	} )
}


function setLeagues() {
	$("select option[value='league']").text(poeLeagues[0])
	$("select option[value='leaguehc']").text(poeLeagues[1])
	$("select option[value='std']").text(poeLeagues[2])
	$("select option[value='stdhc']").text(poeLeagues[3])
}

function changeAction(e, type) {
	if( queryInProgress ) return;
	if( e.nodeName == "SPAN" ) e.previousSibling.checked = true;

	currentAction = type;

	if( type == 'query' ) {
		$('#select-league-row').removeClass('cant-see-this');
		$('#query-row').removeClass('cant-see-this');
		$('#import-row').addClass('cant-see-this');
		$('#export-row').addClass('cant-see-this');
	} else if( type == 'import' ) {
		$('#select-league-row').addClass('cant-see-this');
		$('#query-row').addClass('cant-see-this');
		$('#import-row').removeClass('cant-see-this');
		$('#export-row').addClass('cant-see-this');
	} else if( type == 'export' ) {
		$('#select-league-row').addClass('cant-see-this');
		$('#query-row').addClass('cant-see-this');
		$('#import-row').addClass('cant-see-this');
		$('#export-row').removeClass('cant-see-this');
	}
}

function importData() {
	$('#statusText').text('Importing string');
	try {
        let buff = JSON.parse(document.getElementById('stringInput').value);

        for (var key in buff) {
			// skip loop if the property is from prototype
			if (!buff.hasOwnProperty(key)) continue;

			if( !allowedMapNames.includes(key) ) {
				console.log(`${key} is not a recognized map!`)
				continue;
			}

			var obj = buff[key];
			for (var prop in obj) {
				// skip loop if the property is from prototype
				if (!obj.hasOwnProperty(prop)) continue;

				if( prop == 'completed' ) {
					completedMaps[key] = obj[prop];
				} else if( allowedTiers.includes(parseInt(prop)) && exportTiers[`T${prop}`] && ownedMaps[key][prop] != undefined && Number.isInteger(obj[prop]) && obj[prop] >= 0 ) {
					ownedMaps[key][prop] = obj[prop];
					ownedData[key]["T"+prop].change(obj[prop]);
				} else if( !Number.isInteger(obj[prop]) ) {
					console.log(`${prop} is not an integer or is a negative number.`);
				} else if( !allowedTiers.includes(parseInt(prop)) ) {
					console.log(`${prop} is not a valid tier.`);
				} else if( exportTiers[`T${prop}`] ) {
					//console.log(`${prop} tier is not selected for import.`)
				} else if( !exportTiers[`T${prop}`] ){
					console.log(`Object[${prop}] with value of ${obj[prop]} is invalid for whatever reason.`)
				}
			}
		}

		loadCompletedMaps();
		countTotals();
		saveStorage('completedMaps');
		saveStorage('ownedMaps');

		$('#statusText').text('Success. Perhaps. If the data is there.');
    } catch( ex ) {
        $('#statusText').text(ex);
    }
}

function clearStringInput() {
	document.getElementById('stringInput').value = "";
}

function allowMapNames() {
	let buff = [];

	for (var key in ownedMaps) {
		buff.push(key);
	}
	
	return buff;
}

function exportData() {
	let buff = {};

	for (var key in ownedMaps) {
		// skip loop if the property is from prototype
		if (!ownedMaps.hasOwnProperty(key)) continue;

		//buff[key] = ownedMaps[key]

		var obj = ownedMaps[key];
		for (var prop in obj) {
			// skip loop if the property is from prototype
			if (!obj.hasOwnProperty(prop)) continue;
			if( exportTiers[`T${prop}`] ) {
				if( buff[key] == undefined ) buff[key] = {};
				if( buff[key].completed == undefined ) buff[key].completed = completedMaps[key];
				buff[key][prop] = obj[prop];
			}
		}

		//if( buff.tiers.length > 0 )	dataSet.maps.push(buff);
	}

	copyToClipboard(JSON.stringify(buff));
	
}

function setupTiers() {
	for( let i = 1; i <= 16; ++i ) {
		exportTiers["T"+i] = true;
		mapsPoolTiers["T"+i] = {};
		mapsOwnedTiers["T"+i] = {};
	}
}

function clearLocalStorage() {
	window.localStorage.clear();
}

function loadStorage() {
	if (typeof(Storage) !== "undefined") {
		loaded['settings'] = true;
		loaded['completedmaps'] = true;
		loaded['ownedmaps'] = true;
		loaded['sockets'] = true;


		if( window.localStorage.getItem('settings') != null  ) { settings = JSON.parse(window.localStorage.getItem('settings')); loadSettings(); }
		else loaded['settings'] = false;

		if( window.localStorage.getItem('completedMaps') != null  ) completedMaps = JSON.parse(window.localStorage.getItem('completedMaps'));
		else loaded['completedmaps'] = false;

		if( window.localStorage.getItem('ownedMaps') != null ) ownedMaps = JSON.parse(window.localStorage.getItem('ownedMaps'));
		else loaded['ownedmaps'] = false;

		if( window.localStorage.getItem('selectedSockets') != null ) selectedSockets = JSON.parse(window.localStorage.getItem('selectedSockets'));
		else loaded['sockets'] = false;

	} else {
		loaded['settings'] = false;
		loaded['completedmaps'] = false;
		loaded['ownedmaps'] = false;
		loaded['sockets'] = false;
	}
}

function saveStorage( key ) {
	if (typeof(Storage) !== "undefined") {
		if( key == 'settings' ) window.localStorage.setItem('settings', JSON.stringify(settings));
		if( key == 'completedMaps' ) window.localStorage.setItem('completedMaps', JSON.stringify(completedMaps));
		if( key == 'selectedSockets' ) window.localStorage.setItem('selectedSockets', JSON.stringify(selectedSockets));
		if( key == 'ownedMaps' ) window.localStorage.setItem('ownedMaps', JSON.stringify(ownedMaps));
	} else {
		// console.log('no localstorage');
	}
}

function loadSettings() {
	//if( settings['settingColumnDelimiter'] ) settings['settingColumnDelimiter'] ? $('.table-map-data').addClass('bordered-columns') : $('.table-map-data').removeClass('bordered-columns');
	$("input:checkbox[name='settingColumnDelimiter']").prop('checked', settings['settingColumnDelimiter']);

	if( settings['settingSmallFont'] ) settings['settingSmallFont'] ? $(document.body).addClass('smaller-font') : $(document.body).removeClass('smaller-font');
	$("input:checkbox[name='settingSmallFont']").prop('checked', settings['settingSmallFont']);

	if( settings['settingStripedTables'] ) settings['settingStripedTables'] ? $('.table-regions').addClass('table-striped') : $('.table-regions').removeClass('table-striped');
	$("input:checkbox[name='settingStripedTables']").prop('checked', settings['settingStripedTables']);

	settings['settingColorCompleted'] ? myRoot.style.setProperty('--completed-color-map', '#00cc00') : myRoot.style.setProperty('--completed-color-map', '#fff');
	$("input:checkbox[name='settingColorCompleted']").prop('checked', settings['settingColorCompleted']);

	if( settings['settingHideUnobtainable'] ) settings['settingHideUnobtainable'] ? myRoot.style.setProperty('--hide-unobtainable', 'none') : myRoot.style.setProperty('--hide-unobtainable', 'table-row');
	$("input:checkbox[name='settingHideUnobtainable']").prop('checked', settings['settingHideUnobtainable']);

	if( settings['settingHideCompleted'] ) settings['settingHideCompleted'] ? myRoot.style.setProperty('--hide-completed', 'none') : myRoot.style.setProperty('--hide-completed', 'table-row');
	$("input:checkbox[name='settingHideCompleted']").prop('checked', settings['settingHideCompleted']);

	$("input:checkbox[name='settingAlphaSort']").prop('checked', settings['settingAlphaSort']);
	$("input:checkbox[name='settingLockCompletion']").prop('checked', settings['settingLockCompletion']);
}

function setSettings() {
	settings['settingHideUnobtainable'] = false;
	settings['settingHideCompleted'] = false;
	settings['settingLockCompletion'] = false;
	settings['settingColorCompleted'] = true;
	settings['settingColumnDelimiter'] = false;
	$("input:checkbox[name='settingColorCompleted']").prop('checked', settings['settingColorCompleted']);
	settings['settingAlphaSort'] = false;
	settings['settingStripedTables'] = false;
	settings['settingSmallFont'] = false;
}

function compareTiers(num, name1, name2) {
	let obj1 = globalData.regions[num].maps.find(obj => {
		return obj.name === name1 });
	let obj2 = globalData.regions[num].maps.find(obj => {
		return obj.name === name2 });

	let sum1 = 0;
	let sum2 = 0;

	for( let i = 0; i < 5; ++i ) {
		sum1 += obj1[`level${i}`] > 0;
		sum2 += obj2[`level${i}`] > 0;
	}

	return sum2 > sum1 ? 1 : -1;
}

function sortTables( byName ) {
	if( byName ) {
		for( let i = 0; i<globalData.regions.length; ++i ) {
			$(`#holdMaps${i}`).find('tr.table-map-content').sort(function(a,b) {
				return $(a.childNodes[1]).text().toUpperCase().localeCompare($(b.childNodes[1]).text().toUpperCase());
			}).prependTo(`#holdMaps${i}`);
		}
	} else {
		console.log('help');
		for( let i = 0; i<globalData.regions.length; ++i ) {
			$(`#holdMaps${i}`).find('tr.table-map-content').sort(function(a,b) {
				return compareTiers(i, $(a.childNodes[1]).text(), $(b.childNodes[1]).text());
			}).prependTo(`#holdMaps${i}`);
		}
	}
}

function changeSettings( e, dontSwitch ) {
	if( !dontSwitch ) settings[e.name] = !settings[e.name];

	if( e.name == 'settingSmallFont' ) settings[e.name] ? $(document.body).addClass('smaller-font') : $(document.body).removeClass('smaller-font');
	if( e.name == 'settingColumnDelimiter' ) settings[e.name] ? $('.table-map-data').addClass('bordered-columns') : $('.table-map-data').removeClass('bordered-columns');
	if( e.name == 'settingStripedTables' ) settings[e.name] ? $('.table-regions').addClass('table-striped') : $('.table-regions').removeClass('table-striped');
	if( e.name == 'settingColorCompleted' ) settings[e.name] ? myRoot.style.setProperty('--completed-color-map', '#00cc00') : myRoot.style.setProperty('--completed-color-map', '#fff');
	if( e.name == 'settingHideUnobtainable' ) settings[e.name] ? myRoot.style.setProperty('--hide-unobtainable', 'none') : myRoot.style.setProperty('--hide-unobtainable', 'table-row');
	if( e.name == 'settingHideCompleted' ) settings[e.name] ? myRoot.style.setProperty('--hide-completed', 'none') : myRoot.style.setProperty('--hide-completed', 'table-row');
	if( e.name == 'settingAlphaSort' ) settings[e.name] ? sortTables(true) : sortTables(false);

	saveStorage( 'settings' );
}

function loadCompletedMaps() {
	$('.table-regions .table-map-content').each( function () {triggerCompletion(this, true)} );
}

function loadSockets() {
	for( let i = 0; i < globalData.regions.length; ++i ) if( selectedSockets[i] > 0 ) {
		for( let j = 1; j < 5; j++ ) {
			if( j <= selectedSockets[i] ) $(`#socket-${i}-${j}`).prop('checked', true);
		}
	}
}

function triggerCompletion(e, isLoad) {
	if( settings['settingLockCompletion'] && !isLoad ) return;
	let name = $(e).find('.table-map-name').text();
	if( !isLoad ) completedMaps[name] = !completedMaps[name];
	if( completedMaps[name] ) {
		$(e).find('.completion-content').html("&#10004;");
		$(e).find('.table-map-name').addClass('completed-color-map');
		$(e).addClass('map-is-completed');
	} else {
		$(e).find('.completion-content').html("");
		$(e).find('.table-map-name').removeClass('completed-color-map');
		$(e).removeClass('map-is-completed');
	}

	saveStorage( 'completedMaps' );
}

function changeSockets(e) {
	let buff = e.id.match(/(\d)/g);
	buff[1] = parseInt(buff[1]);
	turnOff = false;
	for(let i = 1; i < 5; ++i ) {
		if( i>buff[1] ) $(`#socket-${buff[0]}-${i}`).prop('checked', false);
		else if( buff[1] == selectedSockets[buff[0]] && i==buff[1] && !$(`#socket-${buff[0]}-${i}`).prop('checked') ) {
			$(`#socket-${buff[0]}-${i}`).prop('checked', false);
			turnOff = true;
		} else $(`#socket-${buff[0]}-${i}`).prop('checked', true);
	}

	selectedSockets[buff[0]]=buff[1]-turnOff;
	columnsBasedOnSocket(buff[0], buff[1]-turnOff);

	saveStorage( 'selectedSockets' )

	countTotals();
}

function columnsBasedOnSocket(region, socket) {
	$(`#holdMaps${region} .selected-column`).removeClass('selected-column');
	$(`#holdMaps${region} tr`).removeClass('map-is-unobtainable');
	$(`#holdMaps${region} .socket-level-${socket} :first-child`).addClass('selected-column');
	$(`#holdMaps${region} .socket-level-${socket} :empty`).parents('tr').addClass('map-is-unobtainable');
}

function countTotals() {
	buffOwnedTiers = {};
	buffPoolTiers = {};
	buffTotalCounts = {};

	for( let i = 0; i<globalData.regions.length; ++i ) {
		for( let j = 0; j<globalData.regions[i].maps.length; ++j ) {
			let buff = globalData.regions[i].maps[j];

			if( buffPoolTiers["T"+buff[`level${selectedSockets[i]}`]] == undefined ) buffPoolTiers["T"+buff[`level${selectedSockets[i]}`]] = 0;
			if( buff[`level${selectedSockets[i]}`] > 0 ) ++buffPoolTiers["T"+buff[`level${selectedSockets[i]}`]];

			for( let k = 0; k < 5; ++k ) {
				if( buffTotalCounts[`${i}-${k}`] == undefined ) buffTotalCounts[`${i}-${k}`] = 0;
				if( buff[`level${k}`] > 0 ) buffTotalCounts[`${i}-${k}`] += ownedData[buff.name]["T"+buff[`level${k}`]].data;
			}
		}
		
		for( let j = 0; j < 5; ++j ) totalCounts[`${i}-${j}`].change(buffTotalCounts[`${i}-${j}`]);
	}

	for (var key in ownedData) {
		// skip loop if the property is from prototype
		if (!ownedData.hasOwnProperty(key)) continue;

		var obj = ownedData[key];
		for (var prop in obj) {
			// skip loop if the property is from prototype
			if (!obj.hasOwnProperty(prop)) continue;
			if( buffOwnedTiers[prop] == undefined ) buffOwnedTiers[prop] = 0;
			buffOwnedTiers[prop] += obj[prop].data;
		}

	}

	for( let i = 1; i <= 16; ++i ) {
		if( buffPoolTiers["T"+i] != undefined ) mapsPoolTiers["T"+i].change(buffPoolTiers["T"+i]);
		else mapsPoolTiers["T"+i].change(0);
		if( buffOwnedTiers["T"+i] != undefined) mapsOwnedTiers["T"+i].change(buffOwnedTiers["T"+i]);
	}
}

function setupRegionTables() {
	$.getJSON("data.json")
	.done(function( data ) {
		globalData = data;
		for( let i = 0; i<globalData.regions.length; ++i ) {
			if( !loaded['sockets'] ) selectedSockets[i] = 0;
			createTable(globalData.regions[i].name, globalData.regions[i].tags, "holdMaps"+i, i<4 ? "#content-column-1" : "#content-column-2", globalData.regions[i].maps, i);
		}
	});
}

function addIconsToRegions( tags ) {
	let str = "";

	if( tags == undefined ) return str;

	for( let i = 0; i < tags.length; i++ ) {
		if( tags[i] == "marble-amulet" ) str += `<span class='icon ${tags[i]}'></span>`;
		if( tags[i] == "opal-ring" ) str += `<span class='icon ${tags[i]}'></span>`;
		if( tags[i] == "two-toned-boots" ) str += `<span class='icon ${tags[i]}'></span>`;
		if( tags[i] == "crystal-belt" ) str += `<span class='icon ${tags[i]}'></span>`;
		if( tags[i] == "steel-ring" ) str += `<span class='icon ${tags[i]}'></span>`;
		if( tags[i] == "two-toned-boots-3b" ) str += `<span class='icon ${tags[i]}'></span>`;
		if( tags[i] == "two-toned-boots-2b" ) str += `<span class='icon ${tags[i]}'></span>`;
		if( tags[i] == "vermillion-ring" ) str += `<span class='icon ${tags[i]}'></span>`;
		if( tags[i] == "convoking-wand" ) str += `<span class='icon ${tags[i]}'></span>`;
		if( tags[i] == "cerulean-ring" ) str += `<span class='icon ${tags[i]}'></span>`;
		if( tags[i] == "blue-pearl-amulet" ) str += `<span class='icon ${tags[i]}'></span>`;
		if( tags[i] == "gripped-gloves" ) str += `<span class='icon ${tags[i]}'></span>`;
		if( tags[i] == "spiked-gloves" ) str += `<span class='icon ${tags[i]}'></span>`;
		if( tags[i] == "fingerless-silk-gloves" ) str += `<span class='icon ${tags[i]}'></span>`;
		if( tags[i] == "vanguard-belt" ) str += `<span class='icon ${tags[i]}'></span>`;
		if( tags[i] == "bone-helm" ) str += `<span class='icon ${tags[i]}'></span>`;
	}

	if( str != "" ) str = " " + str;
	return str;
}

function createTable(regionName, tags, identifier, column, data, num) {
	$(column).loadTemplate("Templates/table-template.html", {
		name: regionName + addIconsToRegions(tags),
		setId: identifier,
		socket1: `socket-${num}-1`,
		socket2: `socket-${num}-2`,
		socket3: `socket-${num}-3`,
		socket4: `socket-${num}-4`
	}, {append: true, afterInsert: function($elem) {addCollapseClick($elem), populateMapRows(data, num)} });
}

async function readyToBind() {
	//check if content is loaded
	if( globalData.regions == undefined || $(`#holdMaps${globalData.regions.length-1}`).find('tr.table-totals').length == 0 ) {
		await new Promise(r => setTimeout(r, 200));
		readyToBind();
	} else {
		for( let i = 0; i<globalData.regions.length; ++i ) {
			for( let j = 0; j<globalData.regions[i].maps.length; ++j ) {
				let data = globalData.regions[i].maps[j];
				ownedData[data.name] = {};
				if( !loaded['completedmaps'] ) completedMaps[data.name] = false;
				if( !loaded['ownedmaps'] ) {
					ownedMaps[data.name] = {};
					if( data.level0 ) ownedMaps[data.name][data.level0] = 0;
					if( data.level1 ) ownedMaps[data.name][data.level1] = 0;
					if( data.level2 ) ownedMaps[data.name][data.level2] = 0;
					if( data.level3 ) ownedMaps[data.name][data.level3] = 0;
					if( data.level4 ) ownedMaps[data.name][data.level4] = 0;
				}
				if( data.level0 ) bindData(data.name, data.level0, ownedMaps[data.name][data.level0], document.getElementById(`${data.name.toLowerCase().replace(/\s/g,'-')}-${0}`));
				if( data.level1 ) bindData(data.name, data.level1, ownedMaps[data.name][data.level1], document.getElementById(`${data.name.toLowerCase().replace(/\s/g,'-')}-${1}`));
				if( data.level2 ) bindData(data.name, data.level2, ownedMaps[data.name][data.level2], document.getElementById(`${data.name.toLowerCase().replace(/\s/g,'-')}-${2}`));
				if( data.level3 ) bindData(data.name, data.level3, ownedMaps[data.name][data.level3], document.getElementById(`${data.name.toLowerCase().replace(/\s/g,'-')}-${3}`));
				if( data.level4 ) bindData(data.name, data.level4, ownedMaps[data.name][data.level4], document.getElementById(`${data.name.toLowerCase().replace(/\s/g,'-')}-${4}`));
			};
		}

		for( let i = 0; i < globalData.regions.length; ++i ) {
			for( let j = 0; j < 5; ++j ) {
				totalCounts[`${i}-${j}`] = new custObj(document.getElementById(`totals-${i}-${j}`), 0);
			}
			columnsBasedOnSocket(i, selectedSockets[i]);
		}

		for( let i = 1; i <= 16; ++i ) {
			mapsPoolTiers["T"+i] = new custObj(document.getElementById(`pool-tiers-${i}`), 0);
			mapsOwnedTiers["T"+i] = new custObj(document.getElementById(`owned-tiers-${i}`), 0);
		}

		countTotals();
		sortTables(settings['settingAlphaSort']);
		loadCompletedMaps();
		loadSockets();
		allowedMapNames = allowMapNames();
		settings['settingColumnDelimiter'] ? $('.table-map-data').addClass('bordered-columns') : $('.table-map-data').removeClass('bordered-columns');
	}
}	

function changeTiers(e) {
	exportTiers[e.name] = exportTiers[e.name] ? false : true;
}

function custObj(element, data) {
	this.data = data;
	this.element = element;
	element.innerHTML = data;
	this.handleOwnedClassChange(data);
	element.addEventListener("change", this, false);
}

custObj.prototype.handleOwnedClassChange = function (data) {
	if( data > 0 ) {
		$(this.element).addClass('owned-amount-more');
		$(this.element).removeClass('owned-amount-zero');
	} else {
		$(this.element).addClass('owned-amount-zero');
		$(this.element).removeClass('owned-amount-more');
	}
}

custObj.prototype.handleEvent = function(event) {
	switch (event.type) {
		case "change": this.change(this.element.innerHTML);
	}
};

custObj.prototype.change = function(value) {
	this.data = value;
	this.element.innerHTML = value;
	this.handleOwnedClassChange(value);
};

function bindData(k1, k2, value, element) {
	ownedData[k1]["T"+k2] = new custObj(element, value, false);
}

function createMapRow(holder, data, r) {
	$(holder).loadTemplate("Templates/map-template.html", {
		name: data.name,
		//isIndoor: data.tag == "indoors_area" ? "" : "", //nothing here yet
		l0c: 'socket-level-0',
		l1c: 'socket-level-1',
		l2c: 'socket-level-2',
		l3c: 'socket-level-3',
		l4c: 'socket-level-4',
		l0t: data.level0 < 6 ? 'low-tier-class' : data.level0 < 11 ? 'mid-tier-class' : 'high-tier-class',
		l1t: data.level1 < 6 ? 'low-tier-class' : data.level1 < 11 ? 'mid-tier-class' : 'high-tier-class',
		l2t: data.level2 < 6 ? 'low-tier-class' : data.level2 < 11 ? 'mid-tier-class' : 'high-tier-class',
		l3t: data.level3 < 6 ? 'low-tier-class' : data.level3 < 11 ? 'mid-tier-class' : 'high-tier-class',
		l4t: data.level4 < 6 ? 'low-tier-class' : data.level4 < 11 ? 'mid-tier-class' : 'high-tier-class',
		level0: data.level0 ? "T"+data.level0+":" : "",
		level1: data.level1 ? "T"+data.level1+":" : "",
		level2: data.level2 ? "T"+data.level2+":" : "",
		level3: data.level3 ? "T"+data.level3+":" : "",
		level4: data.level4 ? "T"+data.level4+":" : "",
		l0id: `${data.name.toLowerCase().replace(/\s/g,'-')}-0`,
		l1id: `${data.name.toLowerCase().replace(/\s/g,'-')}-1`,
		l2id: `${data.name.toLowerCase().replace(/\s/g,'-')}-2`,
		l3id: `${data.name.toLowerCase().replace(/\s/g,'-')}-3`,
		l4id: `${data.name.toLowerCase().replace(/\s/g,'-')}-4`
	}, {append: true});
}

function createTotalsRow(holder, region) {
	$(holder).loadTemplate("Templates/totals-template.html", {
		id0: `totals-${region}-0`,
		id1: `totals-${region}-1`,
		id2: `totals-${region}-2`,
		id3: `totals-${region}-3`,
		id4: `totals-${region}-4`,
	}, {append: true});
}

function populateMapRows(data, num) {
	for( let j = 0; j<data.length; ++j ) {
		createMapRow("#holdMaps"+num, data[j], num);
	}
	createTotalsRow("#holdMaps"+num, num);
}

function addCollapseClick($elem) {
	var $headers = $( $elem ).find('.table-collapse-icon').click(function () {
		$(this).find('span').text(function (_, value) {
			value == '-' ? $($elem).find('tr.table-map-content').addClass('collapse-table') : $($elem).find('tr.table-map-content').removeClass('collapse-table');
			return value == '-' ? '+' : '-'
		});
	});
}

function addCollapseAdditionalInfo() {
	var $headers = $('.additional-content').find('.table-collapse-icon').click(function () {
		$(this).find('span').text(function (_, value) {
			value == '-' ? $(this).parents('thead').siblings('tbody').addClass('collapse-table') : $(this).parents('thead').siblings('tbody').removeClass('collapse-table');
			return value == '-' ? '+' : '-'
		});
	});
}

document.onreadystatechange = function () {
	if (document.readyState == "complete") {
		setupTiers();
		loadStorage();
		if( !loaded['settings'] ) setSettings();
		setLeagues();
		readyToBind();
		addCollapseAdditionalInfo();
		if( isChrome ) {
			chrome.runtime.sendMessage(extID, {event: "handshake"}, function(response) {
				var lastError = chrome.runtime.lastError;
				if( !lastError ) {
					if( response.update == false ) $('#statusText').text('Extension detected. Ready to import!');
					else ( $('#statusText').html(`Consider updating the <a href="${response.url}">extension</a>.`) )
				} else $('#statusText').text("Couldn't connect to extension.");
			});
		} else {
			$("#radio-row input[value='query'").hide();
			$("#radio-row input[value='query'").siblings().first().hide();
			$("#radio-row input[value='import'").prop('checked', true);
			$("#radio-row input[value='import'").change();
			$('#statusText').html(`Use <a href="https://github.com/zedor/poe-map-grabber/releases">AHK script</a> to get data.`)
			$('#query-row').hide();
			$('#select-league-row').hide();
			$('.login-button input').attr('disabled', true);
		}
	}
}

function readIncomingData( data ) {
	for( let i = 0; i<data.length; ++i ) {
		ownedData[data[i].name]["T"+data[i].tier].change(data[i].owned);
		ownedMaps[data[i].name][data[i].tier] = data[i].owned;
	}

	saveStorage('ownedMaps')
	countTotals();
	queryInProgress = false;
}

function generateQuery(account) {
	var dataSet = {};
	dataSet.account = account;
	dataSet.maps = [];
	dataSet.map_series = poeMapSeries;
	dataSet.league = $("select option[selected]").text();

	for (var key in ownedData) {
		// skip loop if the property is from prototype
		if (!ownedData.hasOwnProperty(key)) continue;

		let buff = { name: key, tiers: [] };

		var obj = ownedData[key];
		for (var prop in obj) {
			// skip loop if the property is from prototype
			if (!obj.hasOwnProperty(prop)) continue;
			if( exportTiers[prop] ) buff.tiers.push(parseInt(prop.replace(/T/, '')));
		}

		if( buff.tiers.length > 0 )	dataSet.maps.push(buff);
	}

	return dataSet;
}

function queryData() {
	if( queryInProgress ) return;
	if( document.getElementById('accountInput').value == "" ) {
		$('#statusText').text("Enter account name.");
		return;
	}
	if( Object.values(exportTiers).indexOf(true) == -1 ) {
		$('#statusText').text("Select at least one tier.");
		return;
	}

	var someData = generateQuery($('#accountInput').val());
	queryInProgress = true;

	chrome.runtime.sendMessage(extID, {event: "sendQuery", data: someData }, function(response) {
		var lastError = chrome.runtime.lastError;
		if( lastError ) {
			$('#statusText').text("Couldn't connect to extension.");
			console.log(lastError.message);
			queryInProgress = false;
		} else if( response.result == "success" ) {
			myToken = response.token;
			console.log( 'sendQuery = ' + response.result );
			getMeInfo(myToken);
			//setTimeout(getMeInfo(myToken),1000);
		} else if( response.result == "failed" ) {
			$('#statusText').text("Invalid query (in log). Contact developer.");
			queryInProgress = false;
			console.log(someData);
		}
	});
}

function getMeInfo(token) {
	chrome.runtime.sendMessage(extID, {event: "getProgress", token: token }, async function(response) {
		// response.result ( "waiting" || "ongoing" || "finished" || "failed" || "noQuery" ), response.progress, response.total, response.eta, response.token, response.error
		var lastError = chrome.runtime.lastError;
		if( lastError ) {
			$('#statusText').text("Error encountered. Printed to log.");
			console.log(lastError.message);
			queryInProgress = false;
		} else if( response.result == "waiting" || response.result == "ongoing" ) {
			//console.log(response.progress + ' of ' + response.total + '. ETA: ' + Math.round(response.eta) + 's';
			$('#statusText').text(`Status: ${response.result}. Progress: ${response.progress} of ${response.total}. ETA: ${Math.round(response.eta/1000)}s`);
			await new Promise(r => setTimeout(r, 1000));
			getMeInfo(token);
		} else if ( response.result == "finished" ) {
			grabTheData(token);
		} else if ( response.result == "failed" ) {
			$('#statusText').text(`Error: ${response.error}`);
			queryInProgress = false;
		} else if ( response.result == "noQuery" ) {
			$('#statusText').text(`Error: no query found.`);
			queryInProgress = false;
		} else {
			$('#statusText').text(`Error: unexpected result.`);
			queryInProgress = false;
		}
	});
}

function grabTheData(token) {
	// response.result ( "failed" || "success" ), response.data, response.token
	// use if getProgress result is "finished" to grab the data
	// the data is kept for five minutes after finishing. fails if no query is found

	chrome.runtime.sendMessage(extID, {event: "resolveQuery", token: token }, function(response) {
		var lastError = chrome.runtime.lastError;
		if( lastError ) {
			$('#statusText').text("Error encountered. Printed to log.");
			console.log(lastError.message);
		} else if( response.result == "failed" ) {
			$('#statusText').text("Grabbing data failed. Not ready, or wrong token.");
			console.log(lastError.message);
		} else if( response.result == "success" ) {
			$('#statusText').text(`Status: ${response.result}. Applying data!`);
			console.log(response.data);
			readIncomingData(response.data);
		}
		queryInProgress = false;
	});
}

setupRegionTables();
