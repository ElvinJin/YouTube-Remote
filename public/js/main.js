var tag = document.createElement( 'script' );
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName( 'script' )[ 0 ];
firstScriptTag.parentNode.insertBefore( tag, firstScriptTag );

var player;
function onYouTubeIframeAPIReady() {

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
	socket.emit('play');
}

function broadcastPause () {
	socket.emit('pause');
}

function broadcastStop () {
	socket.emit('stop');
}

function broadcastStepBackward () {
	socket.emit('sb');
}

function broadcastStepForward () {
	socket.emit('sf');
}

function broadcastMute () {
	socket.emit('mute');
}

function broadcastUnmute () {
	socket.emit('unmute');
}
////// SEND - END //////

// BACKWARD - START
function backward () {
	targetTime = player.getCurrentTime() - 2.0;
	if (targetTime < 0) {
		targetTime = 0;
	}
	player.seekTo(targetTime);
}

var backwardTimeOut;

function backwardMouseDown () {
	backward();
	backwardTimeOut = setInterval(function(){backward()}, 300);
}

function backwardMouseUp () {
	clearInterval(backwardTimeOut);
}
// BACKWARD - END

// FORWARD - START
function forward () {
	currentTime = player.getCurrentTime();
	player.seekTo(currentTime+2.0);
}

var forwardTimeOut;

function forwardMouseDown () {
	forward();
	forwardTimeOut = setInterval(function(){forward()}, 300);
}

function forwardMouseUp () {
	clearInterval(forwardTimeOut);
}
// FORWARD - END

////// RECEIVE - START //////
socket.on( 'play', function( ) {
	player.playVideo();
} );

socket.on( 'pause', function( ) {
	player.pauseVideo();
} );

socket.on( 'stop', function( ) {
	player.stopVideo();
} );

socket.on( 'sb', function( ) {
	player.loadVideoById('6Y47qPyoywc');
} );

socket.on( 'backward', function( ) {
	player.playVideo();
} );

socket.on( 'forward', function( ) {
	player.playVideo();
} );

socket.on( 'sf', function( ) {
	player.loadVideoById('RFZrzg62Zj0');
} );

socket.on( 'mute', function( ) {
	player.mute();
} );

socket.on( 'unmute', function( ) {
	player.unMute();
} );
////// RECEIVE - END //////