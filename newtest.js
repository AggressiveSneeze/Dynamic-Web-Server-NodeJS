/**
 * Created by Oak and James on 12/30/2015.
 */

var server = require("./newServer");
var http = require('http');

var serverObj=server.start(8888,function(a){
    a?(console.log(a)):(console.log('Server is up, port 8888'));
});


//serverObj.use('/test/cookie', function(req, res, next) {
//    res.status(200);
//    res.send(req.cookies);
//});
//
//serverObj.use('/x/y', function(req, res, next) {
//    res.status(200);
//    res.send(req.path);
//});
//
serverObj.use('/params/:id/gabi/:num', function(req, res, next) {
    res.status(200);
    console.log('should be sending:');
    console.log(req.path + '->' + JSON.stringify(req.params));
    res.send(req.path + '->' + JSON.stringify(req.params));
});

serverObj.use("/static", server.static("www"));

serverObj.use('/x/y', function(req, res, next) {
    res.status(200);
    res.send(req.path);
});

serverObj.use('/response/test/next', function(req, res, next) {
    res.body = 'next1;';
    res.send();
    //next();
});


serverObj.use('/request/test/params/:param', function(req, res, next) {

    res.status(200);
    res.send(JSON.stringify(req.params));
});



//console.log("Attempting to access 4 different files from ex2, in the following order:");
//console.log("index.html, louis.jpeg, calc.html, profile.html");
//access_file("http://localhost:8888/ex2/index.html");
//access_file("http://localhost:8888/ex2/louis.jpeg");
//access_file("http://localhost:8888/ex2/calc.html");
//access_file("http://localhost:8888/ex2/profile.html");
//
//
//function access_file(path) {
//    console.log('in here:')
//	var get =http.get(path, function(res) {
//		console.log(" Got response"   +res.statusCode);
//		res.resume();
//		}).on('error', function(e) {
//  		console.log("Got error: " + e.message);
//	});
//	serverObj.stop(function(a){
//	    a?(console.log(a)):(console.log('Server is up, port 8888'));
//	});
//}



