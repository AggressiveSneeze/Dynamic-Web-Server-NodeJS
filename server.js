// var net = require('net');

// var server = net.createServer(function(socket) {
// 	socket.write('Echo optato server\r\n');
// 	socket.pipe(socket);
// 	socket.write("cheese");
// });

// server.on('data', function(data) {
// 	console.log('Received: ' + data);
// });

// server.listen(1337, '127.0.0.1');


//From Ryan Dahl's lecture:

var net  = require('net');


var server = net.createServer(function(socket) {
	socket.write("Hello ");
	socket.write("world.");
	socket.on('data', function(data) {
		console.log(data);
	});
});

server.listen(8000);
