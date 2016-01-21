/**
 * Created by Oak on 12/28/2015.
 */

var hujiParser = require('./hujiParser.js');
var net = require('net');
var fs = require('fs');
var path = require('path');

//status
var success_status = 200;


function TypeMap() {
    this['js'] = 'application/javascript';
    this['html'] = 'text/html';
    this['txt'] = 'text/plain';
    this['css'] = 'text/css';
    this['jpg'] = 'image/jpeg';
    this['jpeg'] = 'image/jpeg';
    this['gif'] = 'image/gif';
    this['png'] = 'image/png';
}

exports.handleRequest = function(data, socket, rootFolder) {
    try {
        var request = hujiParser.parseRequest(data.toString().trim());
        //TODO check if this fucks with asynchronicity
        if (request.method!=="GET")  {
            errorResponse(500, socket);
        }
        else {
            var rootRealpath = fs.realpathSync(rootFolder);
            var uriFullPath = path.normalize(rootRealpath + path.sep + request.uri);
            if (uriFullPath.indexOf(rootRealpath) !== 0) {
              errorResponse(404, socket);
             } else {
                 handleResponse(uriFullPath, request, socket);
            }
        }
    }

    catch (e) {
        errorResponse(400, socket);
    }
}

function handleResponse(uriFullPath, request,socket) {
    //console.log("handleResponse");
    fs.stat(uriFullPath, function(err, stats) {
        if(!err && stats.isFile()) {
            var types = new TypeMap();
            var extension = uriFullPath.substr(uriFullPath.lastIndexOf('.')+1,
                                                        uriFullPath.length);

            if(extension in types) {
                var fd = fs.createReadStream(uriFullPath);
                var contentType=types[extension];
                var connection;
                if (request.header.hasOwnProperty('connection')) {
                    connection = request.header['connection'];
                }
                else connection=null;
                var response = new hujiParser.HttpResponse(request.ver, success_status, connection, contentType,
                                                stats.size, fd);

                sendResponse(response, socket);
            }
        }

        else {
            errorResponse(404,socket);
        }
        //if we're here, error handling. TODO
    } )
}

function sendResponse(response, socket) {
    //
    var header = response.toString();

    if (socket.writable) {
        socket.write(header, function() {
            //need to check if socket is writeable still?

            //autocloses with the conditions defined in the project spec.
            if (response.connection==='close' || (!response.connection && response.version==='1.0') ) {
                response.body.pipe(socket);
            }
            else response.body.pipe(socket, {end: false});


        })

    }
    //socket isn't writable, so destroy it:
    socket.on('error', function() {
        //destroy the socket.
        socket.destroy();
    })

}


//open file as buffer.
//file = body

function errorResponse(error_number, socket) {
    var type=new TypeMap();
    var path = error_page(error_number);
    fs.stat(path,function(err,stats) {
        if(!err) {
            var fd=fs.createReadStream(error_page(error_number));
            //if keeping connection open, change the connection arg from null TODO

            var response = new hujiParser.HttpResponse('1.0',error_number, null, type['html'],
                                                        stats.size,fd);

            sendResponse(response,socket);
        }

    })
}


function error_page(error_number) {

    if (error_number===400) {
        return __dirname+path.sep+"400.html";
    }
    if (error_number===404) {
        return __dirname+path.sep+"404.html";
    }
    if (error_number===500) {
        return __dirname+path.sep+"500.html";
    }
    //else what TODO
}




