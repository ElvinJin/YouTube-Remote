var express = require( 'express' );
var app = express();

app.use( express.static( __dirname + '/public' ) );

// Set up root-level routes
// ------------------------
app.get( '/', function ( request, response ) {
	response.sendFile( __dirname + '/views/index.html');
} );

app.get( '/test', function ( request, response ) {
	response.sendFile( __dirname + '/views/indexaa.html');
} );

var host = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 4140;

var server = app.listen( port, host, function () {
	console.log( 'Listening at http://%s:%s', host, port );
} );

var io = require( 'socket.io' )( server );
io.on( 'connection', function( socket ) {

	console.log( 'New user connected' );
	socket.on( 'disconnect', function() {
		console.log( 'User disconnected' );
	} );
	
	socket.on( 'play', function( ) {
		console.log( 'Broadcasting PLAY' );
		io.emit( 'play' );
	} );
	
	socket.on( 'pause', function( ) {
		console.log( 'Broadcasting PAUSE' );
		io.emit( 'pause' );
	} );
	
	socket.on( 'stop', function( ) {
		console.log( 'Broadcasting STOP' );
		io.emit( 'stop' );
	} );
	
	socket.on( 'sb', function( ) {
		console.log( 'Broadcasting STEP-BACKWARD' );
		io.emit( 'sb' );
	} );
	
	socket.on( 'backward', function( ) {
		console.log( 'Broadcasting BACKWARD' );
		io.emit( 'backward' );
	} );
	
	socket.on( 'forward', function( ) {
		console.log( 'Broadcasting FORWARD' );
		io.emit( 'forward' );
	} );
	
	socket.on( 'sf', function( ) {
		console.log( 'Broadcasting STEP-FORWARD' );
		io.emit( 'sf' );
	} );
	
	socket.on( 'mute', function( ) {
		console.log( 'Broadcasting MUTE' );
		io.emit( 'mute' );
	} );
	
	socket.on( 'unmute', function( ) {
		console.log( 'Broadcasting UNMUTE' );
		io.emit( 'unmute' );
	} );
} );