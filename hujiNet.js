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
//TODO add support for multi adding headers/cookies
//TODO support for extra stuff besides number in status
function HttpResponse() {
    this.cookies={};
    this.headers={};
    this.body=null;
    this.status=null;
    this.set=function(field,value){
        this.headers.field=value;
    };
    this.status=function(code){
        this.status=code;
    };
    this.get=function(field){
        return this.headers[field];
    };
    this.cookie=function(name,value){
        this.cookies.name=value;
    };
    this.send=function(body){
        //do something here to send the response.
    };
    this.json=function(body){
        //do something here very similar to above to send a json response.
    };

}
//currently handles static reqs
exports.handleRequest = function(data, socket, rootFolder) {
    try {
        var request = hujiParser.parseRequest(data.toString().trim());

        //TODO check if this fucks with asynchronicity

        //handle types of methods here?
        if (request.method!=="GET")  {
            errorResponse(500, socket);
        }
        else {
            var rootRealpath = fs.realpathSync(rootFolder);
            var urlFullPath = path.normalize(rootRealpath + path.sep + request.path);
            //not sure if necessary, isn't this just checking if the line above was okay?
            if (urlFullPath.indexOf(rootRealpath) !== 0) {
              errorResponse(404, socket);
             } else {
                 handleResponse(urlFullPath, request, socket);
            }
        }
    }

    catch (e) {
        errorResponse(400, socket);
    }
};



function handleResponse(urlFullPath, request,socket) {
    //console.log("handleResponse");
    fs.stat(urlFullPath, function(err, stats) {
        if(!err && stats.isFile()) {
            var types = new TypeMap();

            //gets the extension of the requested file
            var extension = urlFullPath.substr(urlFullPath.lastIndexOf('.')+1,
                                                        urlFullPath.length);

            if(extension in types) {
                var fd = fs.createReadStream(urlFullPath);
                var contentType=types[extension];
                var connection;
                if (request.header.hasOwnProperty('connection')) {
                    connection = request.header['connection'];
                }
                else connection=null;
                //generate the http response string.
                var response = new hujiParser.HttpResponse(request.ver, success_status, connection, contentType,
                                                stats.size, fd);
                //send it to the right socket.
                sendResponse(response, socket);
            }
        }

        else {
            //doesn't exist error
            errorResponse(404,socket);
        }
        //if we're here, error handling. TODO
    } )
}
//sends the given response string to the given socket.
function sendResponse(response, socket) {
    //
    var header = response.toString();

    if (socket.writable) {
        socket.write(header, function() {

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
    if (error_number===410) {
        return __dirname+path.sep+"410.html";
    }
    //else what TODO
}




