/**
 * Created by Oak on 12/29/2015.
 */
var path = require("path");
var url = require('url');
const NOT_IN_ARRAY=-1;
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
//TODO check if consts are okay.

var versionId = ['1.0', '1.1'];

var error_bad_request_format = new Error("Request format unfamiliar");
var error_request_part_missing = new Error("Part of the request is missing");


function HttpRequest() {
    this.method = null;
    this.ver = null;
    this.header = {};
    this.body = null;

    //adding new stuff for ex4
    this.params={};
    this.query={};
    //already has method field
    this.cookies={};
    this.path=null;
    this.host=null;
    this.protocol=null;
    this.get=function(field) {
        return this.header[field];
    };
    this.param=function(field) {
        return this.params[field];
    };
    //todo check if this is okay.
    this.is=function(type) {
        return (this.header['Content-Type']=type);
    };
}

exports.parseRequest = function(data) {

    //console.log("parseRequest" + "\n" + data);
    var requestObj = new HttpRequest();
    var groups = data.split(GROUPS_SEP);
    //console.log("groups are: \n"+groups);
    var meta_data = groups[0].split(NEW_LINE);
    //console.log("meta_data is: \n"+meta_data);
    var request_desc = meta_data[0].split(' ');
    var url_object=url.parse(request_desc[1],true);

    //begin to populate requestObject.
    requestObj.method=request_desc[0];
    var vid = request_desc[VERSION_INDEX].split('/');
    requestObj.protocol=vid[0].toLowerCase();
    requestObj.path=url_object.pathname;
    console.log(requestObj.path);
    requestObj.host=meta_data[1].split(' ')[1].split(':')[0];
    requestObj.query=url_object.query;

    //checks whether the given http method is not in the list
    if((requestsMethods.indexOf(requestObj.method) === NOT_IN_ARRAY)) throw error_bad_request_format;

    //checks whether protocol and version are okay
    if(vid[0] !== 'HTTP' || (versionId.indexOf(vid[1]) === NOT_IN_ARRAY)) throw error_bad_request_format;

    //header and body stuff
    //TODO trim the fat from header (if not needed)
    for(i = 1; i < meta_data.length; i++) {
        var header_line = meta_data[i].split(': ');
        requestObj.header[header_line[0]] = header_line[1];
    }
    console.log('headers are: '+'\n');
    console.log(requestObj.header);
    console.log('end of headers.');
    //obtain and remove cookies from header object.
    //console.log(requestObj.header);

    requestObj.body = '';
    /// reunion groups
    for(i = 1; i < groups.length - 1; i++) {
        requestObj.body = requestObj.body + groups[i] + GROUPS_SEP;
    }
    requestObj.body = requestObj.body + groups[i];
    //console.log(requestObj);
    return requestObj;
};

exports.HttpResponse = function(version, status,connection ,contentType,contentLen,fd) {
    this.version = version;
    this.status = status;
    this.connection = connection;
    this.contentType = contentType;
    this.contentLen = contentLen;
    this.body = fd;
    this.toString = function() {
        var stResponse = '';
        return stResponse.concat('HTTP/', this.version,' ',this.status, NEW_LINE,
                                       'Content-Type: ', this.contentType, NEW_LINE,
                                       'Content-Length: ', this.contentLen, GROUPS_SEP);
    }
};




