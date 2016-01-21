/**
 * Created by Oak on 12/29/2015.
 */
var path = require("path");

var GROUPS_SEP = '\r\n\r\n';
var NEW_LINE = '\r\n';
var METHOD_INDEX = 0;
var URI_INDEX = 1;
var VERSION_INDEX = 2;
var HTTP_PROTOCOL = 'HTTP/';

var requestsMethods = [ 'GET',
                        'HEAD',
                        'POST',
                        'PUT',
                        'DELETE',
                        'CONNECT',
                        'OPTIONS',
                        'TRACE'];

var versionId = ['1.0', '1.1'];

var error_bad_request_format = new Error("Request format unfamiliar");
var error_request_part_missing = new Error("Part of the request is missing");


function HttpRequest() {
    this.method = null;
    this.uri = null;
    this.ver = null;
    this.header = {};
    this.body = null;
}

exports.parseRequest = function(data) {

    //console.log("parseRequest" + "\n" + data);
    var requestObj = new HttpRequest();
    var groups = data.split(GROUPS_SEP);
    console.log(groups);
    var meta_data = groups[0].split(NEW_LINE);
    console.log(meta_data);
    var request_desc = meta_data[0].split(' ');
    var request_type=request_desc[0];
    console.log('printing request type:');
    console.log(request_type);
    //does this bit check what the method is?
    if((requestsMethods.indexOf(request_desc[METHOD_INDEX]) > -1)){

        requestObj.method = request_desc[METHOD_INDEX];

    } else {
        console.log("error 1");
        throw error_bad_request_format;
    }
    //console.log(requestObj.method);
    requestObj.uri = request_desc[URI_INDEX].replace(/\//g, path.sep);
    var vid = request_desc[VERSION_INDEX].split('/');
    if(vid[0] === 'HTTP' && (versionId.indexOf(vid[1]) > -1)) {
            requestObj.ver = vid[1];
    } else {
        console.log("error 2");
        throw error_bad_request_format;
    }

    //problem is in the for loop, throwing error.
    for(i = 1; i < meta_data.length; i++) {
        var header_line = meta_data[i].split(': ');

        requestObj.header[header_line[0]] = header_line[1];

    }
       

    requestObj.body = '';
    /// reunion groups
    for(i = 1; i < groups.length - 1; i++) {
        requestObj.body = requestObj.body + groups[i] + GROUPS_SEP;
    }
    requestObj.body = requestObj.body + groups[i];

    return requestObj;
}

exports.HttpResponse = function(version, status,connection ,contentType,contentLen,fd) {
    this.version = version;
    this.status = status;
    this.connection = connection;
    this.ctype = contentType;
    this.clen = contentLen;
    this.body = fd;
    this.toString = function() {
        var stResponse = '';
        return stResponse.concat('HTTP/', this.version,' ',this.status, NEW_LINE,
                                       'Contenct-Type: ', this.contentType, NEW_LINE,
                                       'Contenct-Length: ', this.contentLen, GROUPS_SEP);
        //return stResponse;
    }
}




