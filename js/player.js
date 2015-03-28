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

function onPlayerStateChange( event ) {
}

function stepBackwardClicked() {
	console.log('sb');
}

function stepForwardClicked () {
	console.log('sf');
}

function backwardClicked() {
	console.log('b');
}

function forwardClicked() {
	console.log('f');
}

function stopVideo() {
	player.stopVideo();
}