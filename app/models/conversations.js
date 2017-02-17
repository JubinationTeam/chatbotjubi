//imports
var db = require('../init/dbConnection');

var mongoose=db.connect();


mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;


//Conversations Schema
var conversationsSchema = new Schema({
    userId:String,
    tag:String,
    answer:String,
    answerType:String,
    tagType:String,
    chatletId:String,
    sessionId:String,
    fbId:String
    
    
});

//Export schema
module.exports=mongoose.model('Conversations',conversationsSchema);