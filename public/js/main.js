var tag = document.createElement( 'script' );
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName( 'script' )[ 0 ];
firstScriptTag.parentNode.insertBefore( tag, firstScriptTag );

var player;
function onYouTubeIframeAPIReady() {
	if (window.innerWidth >= 992) {
		player = new YT.Player( 'player', {
			height : '100%',
			width : '100%',
			playerVars: { 'controls' : 0 },
			videoId : 'M7lc1UVf-VE',
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
				videoId : 'M7lc1UVf-VE',
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
		player.loadVideoById('xsWN1Wakuec');
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
socket.on( 'command', function(cmdReceived) {
	switch (cmdReceived) {
		case 'play':
			player.playVideo();
			break;
		case 'pause':
			player.pauseVideo();
			break;
		case 'stop':
			player.stopVideo();
			break;
		case 'sb':
			player.loadVideoById('6Y47qPyoywc');
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
			player.loadVideoById('RFZrzg62Zj0');
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
	}
	socket.emit('upload', localPlaylist);
	console.log('Uploaded local playlist: ' + localPlaylist);
});

socket.on('replaceLocalPlaylist', function(serverPlaylist){
	localStorage.setItem('playlist', JSON.stringify(serverPlaylist));
	console.log('Replaced local playlist with server playlist');
});

socket.on('videoNotFound', function(){
	var warningLbl = document.createElement('label');
	warningLbl.className = 'control-label';
	warningLbl.setAttribute('for', 'inputError2');
	warningLbl.setAttribute('id', 'errLbl');
	warningLbl.innerHTML = 'Invalid video ID';

	document.getElementById('errorLabel').appendChild(warningLbl);
	document.getElementById('add-btn').disabled = false;
});
////// RECEIVE - END //////