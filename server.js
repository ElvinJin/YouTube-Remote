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
	
	socket.on( 'command', function( cmdReceived ) {
		console.log( 'Broadcasting ' + cmdReceived );
		io.emit('command', cmdReceived);
	} );

} );