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
			// 'onStateChange': onPlayerStateChange
		}
	} );
}

function onPlayerReady( event ) {
	// event.target.playVideo();
}

function onPlayerStateChange ( event ) {
}

function stepBackwardClicked () {
	player.loadVideoById('6Y47qPyoywc');
}

function stepForwardClicked () {
	player.loadVideoById('xsWN1Wakuec');
}

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

function stopVideo() {
	player.stopVideo();
}