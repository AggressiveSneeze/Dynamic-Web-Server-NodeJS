//HujiWebServer
//Author: James Adams

var net = require('net');
var hujiNet = require('./hujiNet');

//array to keep track of sockets
sockets=[];

function start(port,rootFolder,callback) {
	console.log('Starting server.');
	var serverObj={ };

	//using https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
	//adding the immutable (read-only) properties. 
	Object.defineProperty(serverObj, 'port', {
		value: port
	});

	Object.defineProperty(serverObj, 'rootFolder', {
		value: rootFolder
	});

	//create the server (can this be done with a non-anonymous function?)
	var server = net.createServer( function(socket) {
		//since we're dealing with plain text requests, not hexadecimal
		socket.setEncoding("utf8");

		//to prevent memory leak detection
		socket.setMaxListeners(0);

		//2s according to project spec
		socket.setTimeout(2000);

		//keep track of this socket
		console.log("new socket, weow!");
		sockets.push(socket);

		//event handlers

		socket.on('data', function(data) {
			//if we're here, we're receiving data from the user/socket.
			//so, handle the data, sending the data to hujinet.

			//something else here instead TODO
			hujiNet.handleRequest(data, socket,rootFolder);
		});

		socket.on('end',function() {
			var i = sockets.indexOf(socket);
			//console.log("end socket, weno!");
			//safe guard in case socket has already been deleted (so it's not in the sockets array)
			if (i!=-1) sockets.splice(i,1);
		});
	

		socket.on('timeout',function () {
			socket.end();
			//console.log("timeout socket, weno!");
			var i = sockets.indexOf(socket);
			//safe guard in case socket has already been deleted (so it's not in the sockets array)
			if (i!=-1) sockets.splice(i,1);
		});

		//called when the server destroys/closes the connection.
		socket.on('close', function() {
			//console.log("close socket, weno!");
			var i = sockets.indexOf(socket);
			sockets.splice(i,1);
		});
	});

	//send the server with the serverobj which will be returned.
	//This will allow the server to be closed.
	serverObj.server=server;



	//server level stuff:

	//same as previously, but on a server level:
	server.setMaxListeners(0);

	server.listen(port, callback);
	//error handling if server receives an error event.
	server.on('error',function(errorObj) {
		//note, 'close' event will be called directly following this.
		callback(errorObj);
	});

	serverObj.stop = function (callback) {
		//close all the sockets. Ensures the server hard closes, rather than
		//just stopping to accept new connections, when server.close is called.
		for (var i in sockets) {
			sockets[i].destroy();
		}
		this.server.close(function () {
			console.log('server is closed.');
		})
	};
	return serverObj;
}

//export the method so it's publicly accessible upon requiring the module.
exports.start = start;
