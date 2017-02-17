//imports
var db = require('../init/dbConnection');

var mongoose=db.connect();

mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

//Users Schema
var usersSchema= new Schema({
    _id:String,
    email:String,
    firstName:String,
    lastName:String,
    name:String,
    image:String,
    phone:String,
    gender:String,
    country:String,
    fbId:String,
    tags:Schema.Types.Mixed,
    result:Schema.Types.Mixed,
    triggers:Schema.Types.Mixed
});


//Export schema
module.exports=mongoose.model('Users',usersSchema);