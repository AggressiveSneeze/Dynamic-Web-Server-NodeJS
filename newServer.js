//What's here?

var net = require('net');
var hujiNet = require('./hujiNet');

//constructor for a usecase object
function UseCase(resource,requestHandler) {
    this.resource=resource;
    this.requestHandler=requestHandler;
    //TODO can add in regex here.

}



function start (port,callback) {

    console.log('Starting server.');
    var serverObj= {};
    //using https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty


    //adding the immutable (read-only) properties.
    Object.defineProperty(serverObj, 'port', {
        value: port
    });


    //give it an empty array for use cases:
    serverObj.uses=[];



    //and the function for handling the uses:
    serverObj.use=function(resource, requestHandler) {
        //create a regexp string out of the resource string:
        var reg = create_reg(resource);
        this.uses.push(new UseCase(resource,requestHandler));
    };

    //create the server (can this be done with a non-anonymous function?)
    var server = net.createServer( function(socket) {
        //since we're dealing with plain text requests, not hexadecimal
        socket.setEncoding("utf8");

        //to prevent memory leak detection
        socket.setMaxListeners(0);

        //2s according to project spec
        socket.setTimeout(2000);

        //keep track of this socket

        sockets.push(socket);

        //event handlers

        socket.on('data', function(data) {
            //if we're here, we're receiving data from the user/socket.
            //so, handle the data, sending the data to hujinet.
            hujiNet.handleRequest();
        });

        socket.on('end',function() {
            var i = sockets.indexOf(socket);
            sockets.splice(i,1);
        });


        socket.on('timeout',function () {
            socket.end();
            var i = sockets.indexOf(socket);
            sockets.splice(i,1);
        });

        //called when the server destroys/closes the connection.
        socket.on('close', function() {
            var i = sockets.indexOf(socket);
            sockets.splice(i,1);
        });
    });

    //send the server with the serverobj which will be returned.
    //This will allow the server to be closed.
    serverObj.server=server;

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
        });
    };
    return serverObj;

}

function create_reg(resource) {
    var folders = resource.split('/');
    var reg_string = '^';
    for (var i = 0; i < folders.length; i++) {
        //standard
        if (folders[i] != ':') reg_string += folders[i];
        //param
        if (folders[i] === ':') reg_string += '\w*';
        if (i != folders.length - 1) reg_string += '\/';
    }
    reg_string += '$';
    return new RegExp(reg_string);
}
//export the method so it's publicly accessible upon requiring the module.
exports.start = start;

//function use(resource,requestHandler()){
// pretty much here is going to be adding the pair to the data struct.

// }



