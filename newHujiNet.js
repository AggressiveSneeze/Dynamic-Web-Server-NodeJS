/**
 * Created by Oak on 12/28/2015.
 */

var GROUPS_SEP = '\r\n\r\n';
var NEW_LINE = '\r\n';
var hujiParser = require('./newhujiParser.js');
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
function HttpResponse(socket) {
    //where to get from?
    this.version = '1.0';
    this.cookies={
        //each cookie with name has an object as its value with
        //the entries from the .cookie() function.
    };
    this.headers={

        //put some default stuff in here:

    };
    this.socket=socket;
    this.body=null;
    this.status=null;
    this.set=function(field,value){
        this.headers.field=value;
    };
    this.status=function(code){
        this.status=code;
        //return this so another function (like .send() can be stacked)
        return this;
    };
    this.get=function(field){
        return this.headers[field];
    };
    this.cookie=function(name,value,options){
        this.cookies.name={};
        this.cookies[name]['value']=value;
        this.cookies[name]['domain']=options['domain'];
        this.cookies[name]['encode']=options['encode'];
        this.cookies[name]['expires']=options['expires'];
        this.cookies[name]['httpOnly']=options['httpOnly'];
        this.cookies[name]['maxAge']=options['maxAge'];
        this.cookies[name]['path']=options['path'];
        this.cookies[name]['secure']=options['secure'];
        this.cookies[name]['signed']=options['signed'];
    };
    this.send=function(body){
        //covers the most basic body
        this.body=body;
        //do something here to send the response
        //maybe as simple as
        sendResponse(this,this.socket);
        // TODO plus a little fiddling
        //maybe opening a read stream with body..



    };
    this.json=function(body){
        //do something here very similar to above to send a json response.
    };
    //TODO maybe this will have to be changed.
    this.toString = function() {
        var stResponse = '';
        stResponse=stResponse.concat('HTTP/', this.version,' ',this.status, NEW_LINE);
        //check this
        for (header in this.headers) {
            stResponse+=header+headers[header]+NEW_LINE;
        }
        //remove trailing new_line:
        stResponse=stResponse.substring(0,stResponse.length-1);
        //add final group_sep
        stResponse+=GROUPS_SEP;
        return stResponse;
    }

}


//currently handles static reqs
exports.handleRequest = function(data, socket, uses) {
    try {

        var request = hujiParser.parseRequest(data.toString().trim());
        console.log('here1.');
        //now we have the request sans the params
        //let's see what we can do

        //first stage, iterate over all the uses:
        for(var i=0;i<uses.length;i++) {
            //check if the path matches the use:
            var matches=uses[i].reg_obj.reg.exec(request.path);
            //didn't match, move on.
            console.log('here continuing, no match.');
            if (!matches) {
                continue;
            }
            //cool, we've got a match. let's check if we have any params:
            if (uses[i].reg_obj.params.length>1) {
                //cool we have same params to fill in:
                for(var j=1; j<uses[i].reg_obj.params.length;j++) {
                    request[uses[i].reg_obj.params[j]]=matches[j];

                }
            }

            //now we're here with a match that's filled in the params. what now?
            //create a new response object:
            console.log('printing req_obj\n');
            console.log(request);
            console.log('printing response');
            var response = new HttpResponse(socket);

            console.log(response);
            //need some kind of next() method to call:
            uses[i].requestHandler(request,response /*,next()*/);
            //need to be able to return to here somehow.
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
            ////autocloses with the conditions defined in the project spec.
            //if (response.connection==='close' || (!response.connection && response.version==='1.0') ) {
            //    response.body.pipe(socket);
            //}
            //else response.body.pipe(socket, {end: false});
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




