//import user dependencies
var fbStart = require("../facebook/start");

//boot up processes
module.exports.start=function(){
    //fb boot up
    fbStart.sendGetStartedMessage();
}
