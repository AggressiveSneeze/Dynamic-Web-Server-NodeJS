//Author: James Adams Student no 777635004
//Ex4 Internet Technologies, Hebrew University 2015/16 Autumn Semester.

var GROUPS_SEP = '\r\n\r\n';
var NEW_LINE = '\r\n';
var hujiParser = require('./hujiParser.js');
var net = require('net');
var fs = require('fs');
var path = require('path');

//status
var success_status = 200;

function HttpResponse(socket) {
    this.sent=false;
    this.types=new hujiParser.TypeMap();
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
    this.status_code=200;
    this.set=function(field,value){
        //make sure it works for multiple adding:
        if (typeof value === 'undefined') {
            for (var head in field) {
                if (field.hasOwnProperty(head)) {
                    this.headers[head]=field[head];
                }
            }
        }
        else this.headers.field=value;
    };
    this.status=function(code){
        this.status_code=code;
        //return this so another function (like .send() can be stacked)
        return this;
    };
    this.get=function(field){
        return this.headers[field];
    };
    this.cookie=function(name,value,options){
        this.cookies.name={};
        this.cookies[name]['value']=value;
        for(var option in options) {
            if (options.hasOwnProperty(option)) this.cookies[name][option]=options[option];
        }
    };
    this.send=function(body){
        if (typeof(body)==='string') {
            this.body=body;

            if (!this.headers.hasOwnProperty('Content-Type')) this.headers['Content-Type']=this.types['html'];
            this.headers['Content-Length']=this.body.length;
        }

        else if (Buffer.isBuffer(body)){
            this.body=body.toString();
            if (!this.headers.hasOwnProperty('Content-Type')) this.headers['Content-Type']=this.types['html'];
            this.headers['Content-Length']=this.body.length;

        }
        else if (Array.isArray(body) || typeof(body)==='object') {
            this.body=JSON.stringify(body);
            this.headers['Content-Type']=this.types['html'];
            this.headers['Content-Length']=this.body.length;
        }

        //do something here to send the response
        //maybe as simple as
        var header = this.toString();
        if (this.socket.writable) {
            this.socket.write(header);
            this.socket.write(this.body);
        }
        this.sent=true;

    };
    this.json=function(body){
        this.body=JSON.stringify(body);
        if (!this.headers.hasOwnProperty('Content-Type')) this.headers['Content-Type']=this.types['html'];
        this.headers['Content-Length']=this.body.length;
        var header = this.toString();
        if (this.socket.writable) {
            this.socket.write(header);
            this.socket.write(this.body);
        }
        this.sent=true;
    };
    this.toString = function() {
        var stResponse = '';
        stResponse=stResponse.concat('HTTP/', this.version,' ',String(this.status_code), NEW_LINE);
        for (var header in this.headers) {
            if (this.headers.hasOwnProperty(header)) {
                stResponse=stResponse.concat(header,': ',this.headers[header], NEW_LINE);
            }
        }
        //add final new line
        stResponse+=NEW_LINE;
        return stResponse;
    }
}


//Dynamic request handler
exports.handleRequest = function(data, socket, uses) {

    try {
        var if_match=false;
        //parse the request into a HTTPRequest object defined in the parser.
        var request = hujiParser.parseRequest(data.toString().trim());
        //now we have the request sans the params
        //initialise the response object (defined above)
        var response = new HttpResponse(socket);

        //first stage, iterate over all the uses:
        for(var i=0;i<uses.length;i++) {
            //check if the path matches the use:
            var matches=uses[i].reg_obj.reg.exec(request.path);
            //didn't match, move on.
            if (!matches) {
                //console.log('no match.');
                continue;
            }
            if_match=true;
            //quick fix in case we're handling a static resource (which should be served under /static):
            if (uses[i].resource==='/static') response.sent=true;
            //cool, we've got a match. let's check if we have any params:
            if (uses[i].reg_obj.params.length>1) {
                //cool we have same params to fill in:
                for(var j=1; j<uses[i].reg_obj.params.length;j++) {
                    request.params[uses[i].reg_obj.params[j]]=matches[j];
                }
            }
            uses[i].requestHandler(request,response, function(){});
        }

        if(!if_match || response.sent===false) {
            //okay no match, return error response 404 instead as described in spec.:
            response.status(404);
            response.send("The requested resource not found");
        }
    }
    catch (e) {
        //some extra info if needed
        //console.log('error would be this ');
        //console.log(e);
        //console.log(e instanceof SyntaxError); //
        //console.log(e.message);                //
        //console.log(e.name);                   // "SyntaxError"
        //console.log(e.lineNumber);             // 1
        ////console.log('did we get here?');
        errorResponse(400, socket);
    }
};


//sends the given response string to the given socket (rarely used, only for error responses.
function sendResponse(response, socket) {


    var header = response.toString();

    if (socket.writable) {
        socket.write(header, function() {
            //autocloses with the conditions defined in the project spec.
            if (response.connection==='close' || (!response.connection && response.version==='1.0') ) {
                //socket.write(response.body);
            }
            else socket.write(response.body);
        });

    }
    //socket isn't writable, so destroy it:
    socket.on('error', function() {
        //destroy the socket.
        socket.destroy();
    })
}



//static response handler.
exports.handleStaticResponse=function(request,socket,rootFolder) {
    try{
        if (request.method!=="GET")  {
            errorResponse(500, socket);
        }
        else {
            var rootRealpath = fs.realpathSync('./');
            var urlFullPath = path.normalize(rootRealpath + '/'+rootFolder+ request.path);
            console.log(urlFullPath);
            //not sure if necessary, isn't this just checking if the line above was okay?
            if (urlFullPath.indexOf(rootRealpath) !== 0) {


                errorResponse(404, socket);
            }
        }
    }

    catch (e) {

        errorResponse(400, socket);
    }
    fs.stat(urlFullPath, function(err, stats) {
        if(!err && stats.isFile()) {

            var types = new hujiParser.TypeMap();
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
                var response = new hujiParser.HttpResponse(request.version, success_status, connection, contentType,
                    stats.size, fd);

                //send it to the right socket.

                sendStaticResponse(response, socket);
            }
        }

        else {
            //doesn't exist error
            errorResponse(404,socket);
        }
    } )


};


//sends the given response string to the given socket.
function sendStaticResponse(response, socket) {
    //
    var header = response.toString();

    if (socket.writable) {

        socket.write(header, function() {
            //autocloses with the conditions defined in the project spec.
            if (response.connection==='close' || (!response.connection && response.version==='1.0') ) {
                response.body.pipe(socket);
            }
            else response.body.pipe(socket, {end: false});
        });
    }
    //socket isn't writable, so destroy it:
    socket.on('error', function() {
        //destroy the socket.
        socket.destroy();
    })
}

//error handling stuff
function errorResponse(error_number, socket) {
    var type=new hujiParser.TypeMap();
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
}




