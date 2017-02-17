//imports
var db = require('../init/dbConnection');

var mongoose=db.connect();

mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

//messege schema
var messageSchema = new Schema({
    type:String,
    value:String
});
var message =mongoose.model('Message',messageSchema);

//mesageset schema
var messageSetSchema = new Schema({
    messages:[message.schema]
});
var messageSet =mongoose.model('MessageSet',messageSetSchema);

//decider schema
var deciderSchema = new Schema({
            "possibilities": Schema.Types.Mixed,
            link: String
});
var decider =mongoose.model('Decider',deciderSchema);


//chatlet schema
var chatletSchema = new Schema({
        _id:String,
        next: String,
        prev: String,
        answerType: String,
        validationBlock: Boolean,
        conditionBlock: Boolean,
        tagType: String,
        fbVisible: Boolean,
        webVisible: Boolean,
        refreshSession: Boolean,
        validationChatlets:Schema.Types.Mixed,
        options: Schema.Types.Mixed,
        botMessages: [messageSet.schema],
        deciders: [decider.schema]
      }
);

//Export schema
module.exports=mongoose.model('Chatlet',chatletSchema);