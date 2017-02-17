//imports
var db = require('../init/dbConnection');

var mongoose=db.connect();

mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;


//DashBot Schema
var metaDataSchema = new Schema({
    _id:String,
    value:String
    
    
});

//Export schema
module.exports=mongoose.model('Metadata',metaDataSchema);