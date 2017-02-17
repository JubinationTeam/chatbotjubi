//import dependencies
var request =require("request");

//import custom dependencies
var FaceBookProcess = require('./process');
var start = require("./start");

//db dependencies
var Users = require('../models/users');
var Metadata = require('../models/metadata');


     //----------filter in messages--------------Ground Level Abstraction - 0-------------------------------------
   
    //process message received
    module.exports.receivedMessage = function(event) {
      //  console.log(JSON.stringify(event));
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfMessage = event.timestamp;
        if (event.message) {
          var message = event.message;
          var messageId = message.mid;
          var messageText = message.text;
          var messageAttachments = message.attachments;
        }
        if(senderID!=start.getSelfId()){
               // console.log("SOME ONE ELSE SENT")
               fetchUserProfileAndDistributeEvents(senderID,event);
        
        }
        else{
              //  console.log("SELF SENT")
                distributeEvents(event);
        }
    }
    
    function distributeEvents(event){
                 //   console.log(JSON.stringify(event));
                    if (event.message) {
                        if(event.message.text&&!event.message.is_echo){
                            //user sent
                         //   console.log("USER MESSAGED:::");
                            FaceBookProcess.processUserReply(event.sender.id,event.message);
                        }
                        else if (event.message.attachments&&!event.message.is_echo) {
                          //  console.log("USER SENT ATTACHMENT:::");
                            //attachments
                        }
                        else if(event.message.is_echo){
                          //  console.log("ECHO:::");
                            saveMetadata({_id:"fb$"+event.recipient.id,value:event.message.metadata});
                            //echo
                        }
                    }
                    else if(event.delivery){
                      //  console.log("MESSAGE DELIVERED:::");
                        //delivery
                    } 
                    else if(event.read){
                       // console.log("MESSAGE READ:::");
                        //read
                    } 
                    else {
                        console.log("Webhook received unknown event: "+event);
                        //unknown
                    }
    }

function saveMetadata(metadata){
        if(metadata&&metadata!=null){
            var query = {'_id':metadata._id};
            Metadata.findOneAndUpdate(query, metadata, {upsert:true}, function(err, doc){
                if (err){ 
                     console.log("Could not update metadata", metadata.value);
                }
            });
        }
    }


    function saveUserDistributeEvents(user,event){
        if(user&&user!=null){
            Users.findById(user._id, function (err, userPresent) { 
                if(err){
                    console.log("Something went wrong while searching User "+user._id+":"+err);
                }
                else{
                    if(!userPresent||userPresent===null){
                        new Users(user).save(function(error){
                                                if(error){
                                                    console.log("Something went wrong while adding User "+user._id+":"+error);
                                                }
                                                else{
                                                    
                                                        distributeEvents(event);
                                          //          console.log("User added "+user._id);
                                                }
                                        });
                    }
                    else{
                        distributeEvents(event);
                 //       console.log(user._id+" User is already available");
                    }
                }
            } );
        }
    }
    

    function fetchUserProfileAndDistributeEvents(userId,event){
        setTimeout(function(){
            request({
                          url:'https://graph.facebook.com/v2.6/'+userId,
                          qs: { fields:'first_name,last_name,profile_pic,locale,timezone,gender', access_token:start.getToken() }
                         }, 
                         function(err,response,body){ 
                                if (response.statusCode == 200) {
                                 //   console.log("Fetching User profile : Facebook Responded with "+JSON.stringify(response.body));
                                    var fbResponse =JSON.parse(response.body);
                                    saveUserDistributeEvents({
                                        _id:"fb$"+userId,
                                        gender:fbResponse.gender,
                                        firstName:fbResponse.first_name,
                                        name:fbResponse.first_name,
                                        lastName:fbResponse.last_name,
                                        image:fbResponse.profile_pic,
                                        fbId:userId
                                    },event);

                                } else {
                                     distributeEvents(event);
                                    console.log("Fetching User Profile Failed "+JSON.stringify(response.body));
                                }
                  }); 
        },500);
    }
    //XXXXXX----filter in messages--------------Ground Level Abstraction - 0-------------------------------XXXXXXX


    
    
    
    
