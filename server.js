var express = require( 'express' );
var app = express();
var sessionDic = {};

app.use( express.static( __dirname + '/public' ) );

// Set up root-level routes
// ------------------------

app.get( '/', function ( request, response ) {
	var sessionCount = 1;
	var targetSession = sessionCount.toString();
	while (targetSession in sessionDic) {
		sessionCount++;
		targetSession = sessionCount.toString();
	}
	response.redirect('/session/' + targetSession);
} );

app.get( '/session/:id([0-9]+)', function ( request, response ) {
	if (!(request.params.id in sessionDic)) {
		sessionDic[request.params.id] = {'numClients' : 0, 'playlist' : []};
	}
	response.sendFile( __dirname + '/views/index.html');
} );

var host = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 4140;

var server = app.listen( port, host, function () {
	console.log( 'Listening at http://%s:%s', host, port );
} );

var io = require( 'socket.io' )( server );
io.on( 'connection', function( socket ) {

	var sessionID;

	socket.on('disconnect', function() {
		console.log( 'User disconnected' );
		if (sessionDic[sessionID] !== undefined && sessionDic[sessionID] !== null) {
			sessionDic[sessionID]['numClients'] = sessionDic[sessionID]['numClients'] - 1;
			console.log('User left room ' + sessionID + '. # of users: ' + sessionDic[sessionID]['numClients']);

			if (sessionDic[sessionID]['numClients'] == 0) {
				sessionDic[sessionID]['playlist'] = [];
				console.log('Nobody left, playlist for room ' + sessionID + ' cleared.');
			}
		}

	});

	socket.on('register', function(id){
		sessionID = id;
		socket.join(sessionID);
		sessionDic[sessionID]['numClients'] = sessionDic[sessionID]['numClients'] + 1;
		console.log('New user joined room ' + sessionID + '. # of users: ' + sessionDic[sessionID]['numClients']);

		if (sessionDic[sessionID]['numClients'] == 1) {
			socket.emit('requestLocalPlaylist');
		} else if (sessionDic[sessionID]['numClients'] > 1) {
			socket.emit('replaceLocalPlaylist', sessionDic[sessionID]['playlist']);
		}
	});

	socket.on('upload', function(localPlaylist) {
		sessionDic[sessionID]['playlist'] = localPlaylist;
		console.log('Replaced server playlist with local playlist ' + JSON.stringify(sessionDic[sessionID]['playlist']));
	});
	
	socket.on('command', function( cmdReceived ) {
		if (sessionID) {
			console.log( 'Broadcasting \'' + cmdReceived + '\' to room ' + sessionID);
			io.to(sessionID).emit('command', cmdReceived);
		} else {
			socket.send("You haven't joined any session yet. Please refresh your browser.");
		}
	});

} );