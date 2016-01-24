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

exports.TypeMap=function() {
    this['js'] = 'application/javascript';
    this['html'] = 'text/html';
    this['txt'] = 'text/plain';
    this['css'] = 'text/css';
    this['jpg'] = 'image/jpeg';
    this['jpeg'] = 'image/jpeg';
    this['gif'] = 'image/gif';
    this['png'] = 'image/png';
    this['json']='application/json';
};

function HttpRequest() {
    this.method = null;
    this.ver = null;
    this.header = {};
    this.body = null;
    this.types = new exports.TypeMap();

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
        if (this.params.hasOwnProperty(field)) {
            return this.params[field];
        }
        else if (this.query.hasOwnProperty(field)) return this.query[field];
        else return null;
    };

    this.is=function(type) {
        var this_type = this.header['Content-Type'].split(';')[0];
        return (this_type==type ||this_type==this.types[type]);
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
    requestObj.host=meta_data[1].split(' ')[1];
    requestObj.query=url_object.query;


    //checks whether the given http method is not in the list
    if((requestsMethods.indexOf(requestObj.method) === NOT_IN_ARRAY)) throw error_bad_request_format;

    //checks whether protocol and version are okay
    if(vid[0] !== 'HTTP' || (versionId.indexOf(vid[1]) === NOT_IN_ARRAY)) throw error_bad_request_format;

    //header and body stuff
    //TODO trim the fat from header (if not needed)
    for(var i = 1; i < meta_data.length; i++) {
        var header_line = meta_data[i].split(': ');
        requestObj.header[header_line[0]] = header_line[1];
    }
    //obtain and remove cookies from header object.
    if (requestObj.header.hasOwnProperty('Cookie')) {
        var temp_cookies = requestObj.header['Cookie'];
        temp_cookies = temp_cookies.split(';');
        for (i = 0; i < temp_cookies.length; i++) {
            var cookie = temp_cookies[i].split('=');
            requestObj.cookies[cookie[0].trim()] = cookie[1].trim();
        }
        delete requestObj.header['Cookie'];
    }

    //console.log('got these cookies:');
    //console.log(requestObj.cookies);
    //TODO: write bodyparser middleware. however no points deducted, so returning as string as instructed in forums.
    requestObj.body = '';
    if (typeof groups[1]==='undefined') requestObj.body='';
    else requestObj.body=groups[1];
    //console.log(requestObj.body);
    //for(i = 1; i < groups.length - 1; i++) {
    //    console.log('body component: ');
    //    console.log(groups[i]);
    //    requestObj.body = requestObj.body + groups[i] + GROUPS_SEP;
    //}
    ////add the last part of the body (only if there was a body)
    //if (i>1) requestObj.body = requestObj.body + groups[i];
    ////reassign body to null as described in project spec (if no body exists.)
    //if (requestObj.body==='') requestObj.body=null;
    //console.log('request body is: ');
    //console.log(requestObj.body);
    return requestObj;
};

//for static (used in ex3 so carried over for this.)
exports.HttpResponse = function(version, status,connection ,contentType,contentLen,fd) {
    this.version = version;
    this.status = status;
    this.connection = connection;
    this.contentType = contentType;
    this.contentLen = contentLen;
    this.body = fd;
    this.toString = function() {
        var stResponse = '';
        return stResponse.concat(HTTP_PROTOCOL, this.version,' ',this.status, NEW_LINE,
            'Content-Type: ', this.contentType, NEW_LINE,
            'Content-Length: ', this.contentLen, GROUPS_SEP);
    }
};




