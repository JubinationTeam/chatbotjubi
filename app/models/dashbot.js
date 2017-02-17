//imports
var db = require('../init/dbConnection');

var mongoose=db.connect();

mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;


//DashBot Schema
var dashbotSchema = new Schema({
    userId:String,
    text:String
    
    
});

//Export schema
module.exports=mongoose.model('Dashbot',dashbotSchema);