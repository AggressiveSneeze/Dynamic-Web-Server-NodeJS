/**
 * Created by Oak and James on 12/30/2015.
 */

var serve = require("./hujiwebServer");
var http = require('http');

var server=serve.start(8888,function(a){
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
//serverObj.use('/params/:id/gabi/:num', function(req, res, next) {
//    res.status(200);
//    console.log(req.path + '->' + JSON.stringify(req.params));
//    res.send(req.path + '->' + JSON.stringify(req.params));
//});
//
//serverObj.use("/static", server.static("www"));
//
//serverObj.use('/x/y', function(req, res, next) {
//    res.status(200);
//    res.send(req.path);
//});
//
//serverObj.use('/response/test/next', function(req, res, next) {
//    res.body = 'next1;';
//    res.send();
//    //next();
//});
//
//
//serverObj.use('/request/test/params/:param', function(req, res, next) {
//
//    res.status(200);
//    res.send(JSON.stringify(req.params));
//});

//server.use("/static", serve.static("www"));
//server.use('/test/cookie', function(req, res, next) {
//    res.status(200);
//    res.send(req.cookies);
//});
//
//server.use('/x/y', function(req, res, next) {
//    res.status(200);
//    res.send(req.path);
//});
//
//server.use('/params/:id/gabi/:num', function(req, res, next) {
//    res.status(200);
//    res.send(req.path + '->' + JSON.stringify(req.params));
//});
//
//
//server.use(function(req, res, next) {
//    if (req.path == '/catchme/foo/boo/style.css') {
//        res.status(200);
//        res.send("catch /*");
//        return;
//    }
//    next();
//});


//server.use('/request/test/params/:param', function(req, res, next) {
//
//    res.status(200);
//    res.send(JSON.stringify(req.params));
//});

//
//server.use('/request/test/query', function(req, res, next) {
//    res.status(200);
//    res.send(JSON.stringify(req.query));
//});
//
//
//server.use('/request/test/cookie', function(req, res, next) {
//    res.status(200);
//    res.send(JSON.stringify(req.cookies));
//});
//
//
//server.use('/request/test/path', function(req, res, next) {
//    res.status(200);
//    res.send(req.path);
//});
//
//server.use('/request/test/host', function(req, res, next) {
//    res.status(200);
//    res.send(req.host);
//});
//
//
//server.use('/request/test/protocol', function(req, res, next) {
//    res.status(200);
//    res.send(req.protocol);
//});
//
//server.use('/request/test/get/Content-Type', function(req, res, next) {
//    res.status(200);
//    res.send(req.get("Content-Type"));
//});
//
//server.use('/request/test/get/content-type', function(req, res, next) {
//    res.status(200);
//    res.send(req.get("content-type"));
//});
//
//server.use('/request/test/get/Something', function(req, res, next) {
//    res.status(200);
//    res.send(req.get("Something"));
//});
//
//

//server.use('/request/test/param', function(req, res, next) {
//    res.status(200);
//    res.send(req.param('name'));
//});
//
server.use('/request/test/params_input/user/:name', function(req, res, next) {
    res.status(200);
    console.log(req.param('name'));
    res.send(req.param('name'));
});

//
//server.use('/request/test/is', function(req, res, next) {
//    var t = req.is(req.body);
//    t = (t) ? "true" : "false";
//    res.status(200);
//    res.send(t);
//});
//
//
//
//
//
//server.use('/response/test/status', function(req, res, next) {
//    res.status(404).send("gabi was here");
//});
//
//server.use('/response/test/get', function(req, res, next) {
//    res.set({
//        'Content-Type': 'response_test_set'
//    });
//    res.status(200);
//    res.send(res.get('Content-Type'))
//});
//
//server.use('/response/test/cookie', function(req, res, next) {
//    res.cookie('name', 'tobi', {
//        domain: '.example.com',
//        path: '/admin',
//        secure: true
//    });
//    res.status(200).send();
//});
//
//server.use('/response/test/send/:id', function(req, res, next) {
//    res.status(200);
//
//    switch (req.params.id) {
//        case '1':
//            res.send(new Buffer('whoop'))
//            break;
//        case '2':
//            res.send({
//                some: 'json'
//            });
//            break;
//        case '3':
//            res.send('some html');
//            break;
//        case '4':
//            res.status(404).send('Sorry, we cannot find that!');
//            break;
//        case '5':
//            res.status(500).send({
//                error: 'something blew up'
//            });
//            break;
//        case '6':
//            res.send();
//            break;
//        default:
//            res.status(404).send();
//    }
//});
//
//server.use('/response/test/json/:id', function(req, res, next) {
//    res.status(200);
//
//    switch (req.params.id) {
//        case '1':
//            res.json(null);
//            break;
//        case '2':
//            res.json({
//                user: 'tobi'
//            });
//            break;
//        case '3':
//            res.status(500);
//            res.json({
//                error: 'message'
//            });
//            break;
//        default:
//            res.status(404).send();
//    }
//});
////
//
//server.use('/response/test/next', function(req, res, next) {
//    res.body = 'next1;'
//    next();
//});
//
//server.use('/response/test/next', function(req, res, next) {
//    res.body += 'next2;'
//    next();
//});
//
//server.use('/response/test/next', function(req, res, next) {
//    res.body += 'next3;'
//    res.status(200).send(res.body);
//});
//
//
//server.use('/test/exceptions_handling', function(req, res, next) {
//
//    // cause an exceptions
//    throw "server internal exception...";
//
//});
//
//
//server.use('/test/cookie', function(req, res, next) {
//    res.send(200, req.cookies);
//});
//server.use('/test/json', function(req, res, next) {
//    res.status(200).send(JSON.stringify(req.body));
//});
//
//server.use('/request/test/cookie', function(req, res, next) {
//    res.status(200);
//    res.send(JSON.stringify(req.cookies));
//});
//
////
//
//
//server.use('/test/bodyParser', function(req, res, next) {
//    res.status(200).send(JSON.stringify(req.body));
//});



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



