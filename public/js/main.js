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

var socket = io();
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
////// RECEIVE - END //////