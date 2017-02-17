//import dependencies
var mongoose = require("mongoose");

//db declarations
var dbType="mongodb"
var dbName="jubination";
var dbHost="ds139909.mlab.com";
var dbPort="39909";
var dbUsername="root";
var dbPassword="jubination1234";


module.exports.init=function(){
        //db setup
        mongoose.Promise = global.Promise;
        mongoose.connect(dbType+"://"+dbUsername+":"+dbPassword+"@"+dbHost+":"+dbPort+"/"+dbName,
        function(err){
            if(err){
                console.log("Not connected to db"+ err);
            }
            else{
                console.log("Sucessfully connected");
            }
        });
}


//exporting db Connection
module.exports.connect=function(){
    return mongoose;
}