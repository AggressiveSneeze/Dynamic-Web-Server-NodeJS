var server = require("./hujiwebServer");

var serverObj=server.start(8888,function(a){
    a?(console.log(a)):(console.log('Server is up, port 8888'));
});

serverObj.use("/static", server.static("www"));
