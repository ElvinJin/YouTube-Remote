var tag = document.createElement( 'script' );
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName( 'script' )[ 0 ];
firstScriptTag.parentNode.insertBefore( tag, firstScriptTag );

// load QR code
var qrImg = document.createElement('img');
qrImg.src = 'https://chart.googleapis.com/chart?cht=qr&chs=100x100&chl=' + encodeURIComponent(document.URL);
qrImg.className = 'qrImg';
var qrDiv = document.getElementById('qrcode');
qrDiv.appendChild(qrImg);

// load player
var player;
var playingIndex = -1;
function onYouTubeIframeAPIReady() {
	if (window.innerWidth >= 992) {
		player = new YT.Player( 'player', {
			height : '100%',
			width : '100%',
			playerVars: { 'controls' : 0 },
			videoId: '',

			events : {
				// 'onReady': onPlayerReady,
				'onStateChange': onPlayerStateChange
			}
		} );
	}
}

window.addEventListener('resize', function() {
	if (window.innerWidth >= 992) {
		if (player === null) {
			player = new YT.Player( 'player', {
				height : '100%',
				width : '100%',
				playerVars: { 'controls' : 0 },
				videoId: '',
				events : {
					// 'onReady': onPlayerReady,
					'onStateChange': onPlayerStateChange
				}
			} );
		}
	} else {
		if (player !== null) {
			player.destroy();
		}
		player = null;
	}
});

function onPlayerReady( event ) {
	// event.target.playVideo();
}

function onPlayerStateChange ( event ) {
	if (event.data == YT.PlayerState.ENDED) {
		var localPlaylist = JSON.parse(localStorage.getItem('playlist'));
		if (playingIndex < localPlaylist.length - 1) {
			playingIndex = playingIndex + 1;
			player.loadVideoById(localPlaylist[playingIndex]['id']);
		}
	}
}

function getSessionID () {
	var urlParser = document.URL.split("/");
	var sessionID = urlParser[urlParser.length - 1];
	if (sessionID == '') {
		sessionID = urlParser[urlParser.length - 2];
	}
	return sessionID;
}

var socket = io();
var sessionID = getSessionID();
// console.log('session: ' + sessionID);
socket.emit('register', sessionID);

////// SEND - START //////
function broadcastPlay () {
	socket.emit('command', 'play');
}

function broadcastPause () {
	socket.emit('command', 'pause');
}

function broadcastStop () {
	socket.emit('command', 'stop');
}

function broadcastStepBackward () {
	socket.emit('command', 'sb');
}

var backwardTimeOut;
function backwardMouseDown () {
	socket.emit('command', 'backward');
	backwardTimeOut = setInterval(function(){socket.emit('command', 'backward');}, 300);
}
function backwardMouseUp () {
	clearInterval(backwardTimeOut);
}

var forwardTimeOut;
function forwardMouseDown () {
	socket.emit('command', 'forward');
	forwardTimeOut = setInterval(function(){socket.emit('command', 'forward');}, 300);
}
function forwardMouseUp () {
	clearInterval(forwardTimeOut);
}

function broadcastStepForward () {
	socket.emit('command', 'sf');
}

function broadcastMute () {
	socket.emit('command', 'mute');
}

function broadcastUnmute () {
	socket.emit('command', 'unmute');
}

function addVideo() {	
	document.getElementById('errorLabel').innerHTML = '';

	var vid = document.getElementById('vid-input').value;
	console.log('Adding video: ' + vid);
	if (vid !== null && vid != '') {
		socket.emit('addVideo', vid);
		document.getElementById('add-btn').disabled = true;
	};
}
////// SEND - END //////

////// RECEIVE - START //////
function stepBackward(){
	var localPlaylist = JSON.parse(localStorage.getItem('playlist'));

	if (playingIndex - 1 >= 0 && playingIndex - 1 < localPlaylist.length) {
		playingIndex = playingIndex - 1;
		player.loadVideoById(localPlaylist[playingIndex]['id']);
	};
}

function stepForward(){
	var localPlaylist = JSON.parse(localStorage.getItem('playlist'));

	if (playingIndex + 1 >= 0 && playingIndex + 1 < localPlaylist.length) {
		playingIndex = playingIndex + 1;
		player.loadVideoById(localPlaylist[playingIndex]['id']);
	};
}

socket.on( 'command', function(cmdReceived) {
	switch (cmdReceived) {
		case 'play':
			if (playingIndex < 0) {
				stepForward();
			} else {
				player.playVideo();
			}
			break;
		case 'pause':
			player.pauseVideo();
			break;
		case 'stop':
			player.stopVideo();
			break;
		case 'sb':
			stepBackward();
			break;
		case 'backward':
			targetTime = player.getCurrentTime() - 2.0;
			if (targetTime < 0) {
				targetTime = 0;
			}
			player.seekTo(targetTime);
			break;
		case 'forward':
			currentTime = player.getCurrentTime();
			player.seekTo(currentTime+2.0);
			break;
		case 'sf':
			stepForward();
			break;
		case 'mute':
			player.mute();
			break;
		case 'unmute':
			player.unMute();
			break;
		default:
			console.log('Command received is not recognized');
			break;
	}
});

socket.on('requestLocalPlaylist', function() {
	var localPlaylist = JSON.parse(localStorage.getItem('playlist'));
	if (localPlaylist === null) {
		localPlaylist = [];
		localStorage.setItem('playlist', JSON.stringify(localPlaylist));
	}
	socket.emit('upload', localPlaylist);
	console.log('Uploaded local playlist: ' + localPlaylist);
});

socket.on('replaceLocalPlaylist', function(serverPlaylist){
	localStorage.setItem('playlist', JSON.stringify(serverPlaylist));
	console.log('Replaced local playlist with server playlist');
	for (var i = 0; i < serverPlaylist.length; i++) {
		addToPlaylistView(serverPlaylist[i], i);
	};
});

socket.on('addFailed', function(errMsg){
	var warningLbl = document.createElement('label');
	warningLbl.className = 'control-label';
	warningLbl.setAttribute('for', 'inputError2');
	warningLbl.setAttribute('id', 'errLbl');
	warningLbl.innerHTML = errMsg;

	document.getElementById('errorLabel').appendChild(warningLbl);
	document.getElementById('add-btn').disabled = false;
});

socket.on('addUpdate', function(videoInfo){
	document.getElementById('vid-input').value = '';

	var localPlaylist = JSON.parse(localStorage.getItem('playlist'));
	localPlaylist.push(videoInfo);
	localStorage.setItem('playlist', JSON.stringify(localPlaylist));

	var index = localPlaylist.length - 1;
	addToPlaylistView(videoInfo, index);

	document.getElementById('add-btn').disabled = false;

});

socket.on('removeUpdate', function(vid, index){
	console.log('removing video: ' + vid);
	var localPlaylist = JSON.parse(localStorage.getItem('playlist'));
	localPlaylist.splice(index, 1);
	localStorage.setItem('playlist', JSON.stringify(localPlaylist));

	var listTable = document.getElementById('list-table');
	var element = document.getElementById(vid);
	listTable.removeChild(element);

	if (index < playingIndex) {
		playingIndex--;
	} else if(index > playingIndex) {
		playingIndex++;
	} else {
		player.stopVideo();
		playingIndex = -1;
	}

});

socket.on('loadVideo', function(vid, index) {
	player.loadVideoById(vid);
	playingIndex = index;
});
////// RECEIVE - END //////

function addToPlaylistView(videoInfo, index) {
	var videoBtn = document.createElement('button');
	videoBtn.classList.add('col-xs-10');
	videoBtn.classList.add('row-content');
	videoBtn.onclick = function(){
		var vid = videoInfo['id'];
		var thisIndex = index;
		socket.emit('playClickedVideo', vid, thisIndex);
	};
	videoBtn.innerHTML = videoInfo['id'] + ': ' + videoInfo['title'];

	var deleteBtn = document.createElement('button');
	deleteBtn.classList.add('col-xs-2');
	deleteBtn.classList.add('custom-btn');
	deleteBtn.classList.add('del-btn');
	deleteBtn.innerHTML = 'delete'
	deleteBtn.onclick = function(){
		socket.emit('removeVideo', videoInfo['id']);
	};

	var div = document.createElement('div');
	div.classList.add('list-row');
	div.classList.add('col-xs-12');
	div.appendChild(videoBtn);
	div.appendChild(deleteBtn);
	div.setAttribute('id', videoInfo['id']);

	document.getElementById('list-table').appendChild(div);
}