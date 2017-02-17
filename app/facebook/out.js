//import dependencies
var request = require("request");
var promise = require("q");

//user dependencies
var start = require("./start");

var waitBase=1000;
var waitCoeff=40;
var gapTime=500;
var textAndTypingOffGap=100;
var imageBuffer=1000;

var lastSentWasImage=false;
var token=start.getToken();


   
   //~~~~~---------------------------------------------------/Output/-----------------------------------------------~~~~~~~~~~
   
    
    //------------------------------------Chatlet to Response------Abstraction Level - III-----------------------------------------
    module.exports.sendChatletResponse=function(chatlet,userID){
            createAndSendResponse({
                chatletId:chatlet.chatletId,
                sessionId:chatlet.sessionId,
                userId:userID,
                answerType:chatlet.answerType,
                options:chatlet.options,
                botMessage:chatlet.botMessage,
                metadata:chatlet.chatletId+"$"+chatlet.answerType+"$"+chatlet.tagType
            });
        };
    
        function random (length) {
            return parseInt(Math.random()*parseInt(length));
        }
        function createAndSendResponse(response){
            var callbackList=[];
            var time=0;
            for(var i=0;i<response.botMessage.length;i++){

                if(i!=0){
                    time+=gapTime;
                }

                if(lastSentWasImage){
                    time+=imageBuffer;
                    lastSentWasImage=false;
                }

                if(response.botMessage[i].type==="image"){
                    lastSentWasImage=true;
                }

                callbackList.push(typingStart(response,time));

                time+=waitBase+waitCoeff*response.botMessage[i].value.length;
                callbackList.push(messageStart(response,i,time));

                time+=textAndTypingOffGap;
                callbackList.push(typingStop(response,time));
            }
            Promise.all(callbackList)
                .then(values => {
                //console.log(values);
            })
                .catch(error => {console.log(error);});

        }
    
    //XXXXXXXXXX---------------------------Chatlet to Response------Abstraction Level - III----------------------XXXXXX

    //----create and send chatlet message structures---------Abstraction Level - II-------------------------------------

function typingStart(response,time){
    setTimeout(function(){sendTypingOn(response.userId)},time);
    return "typing-on-"+time;
} 

function messageStart(response , i,time){
    setTimeout(
        function(){
        
        if(i==response.botMessage.length-1&&(response.answerType==="text-option"||response.answerType==="option")){
            sendBotMessageWithOption(response.userId, response.metadata, response.botMessage[i].value, response.botMessage[i].type, response.options);
         }
         else{
            sendBotMessage(response.userId,response.metadata,response.botMessage[i].value,response.botMessage[i].type);
         } 
    },time);
    return time;
}   

function typingStop(response,time){
    setTimeout(function(){sendTypingOff(response.userId)},time);
    return "typing-off-"+time;
} 
    
    //XXXXX-create and send chatlet message structures---------Abstraction Level - II------------------------XXXXXXXXXX
    
    //----create and send chatlet message structures---------Abstraction Level - I-------------------------------------
    function sendBotMessage(userId,metadata,botMessage,type){
        
            // console.log(botMessage);
            if(type==="image"){
                    sendImageMessage(userId,metadata,botMessage); 
                }
                else if(type==="text"){
                  sendTextMessage(userId,metadata,botMessage);
                }
        return botMessage;

    }

    function sendBotMessageWithOption(userId,metadata,botMessage,type,options){
        
            // console.log(botMessage+":options");
            if(type==="image"){
                sendImageAndOptionMessage(userId,metadata,botMessage,options); 
            }
            else if(type==="text"){
                sendTextAndOptionMessage(userId,metadata,botMessage,options);

            }
       
        return botMessage;
    }
 //typing on
    function sendTypingOn(recipientId){
                var messageData={
                        recipient:{
                                    id:recipientId
                                  },
                        sender_action:"typing_on"
                };

               callSendAPI(messageData);
       
        return "typing_on";
    }
    
    //typing off
    function sendTypingOff(recipientId){
        
                var messageData={
                        recipient:{
                                    id:recipientId
                                  },
                      sender_action:"typing_off"
                };

                callSendAPI(messageData);
      
        return "typing_off";
    }
    
   
    //XXX----create and send chatlet message structures---------Abstraction Level - I------------------------------XXXX
    
    //----create and send fb message structures--------------Ground Level Abstraction - 0-------------------------------
   
    //text message
    function sendTextMessage(recipientId,metaData, messageText) {
         
                      var messageData = {
                        recipient: {
                          id: recipientId
                        },
                        message: {
                            text:messageText,
                            metadata:metaData
                        }
                      };
                      callSendAPI(messageData);
    }
    
    //image message
    function sendImageMessage(recipientId,metaData, messageImageUrl) {
        
          var messageData = {
            recipient: {
              id: recipientId
            },
            message: {
                attachment:{
                  type:"image",
                  payload:{
                    url:messageImageUrl
                  }
                },
                metadata:metaData
            }
          };
        callSendAPI(messageData);
    }
    
    //image and options
     function sendImageAndOptionMessage(recipientId,metaData, messageImageUrl,options) {
         
         //prepare options
         if(Object.keys(options).length<=10){
             var fbOptions=[];
             Object.keys(options).forEach(function(key){
                 var value={
                        content_type:"text",
                        title:key,
                        payload:options[key]
                      };
                 fbOptions.push(value);
             });
         
              var messageData = {
                recipient: {
                  id: recipientId
                },
                message: {
                    attachment:{
                          type:"image",
                          payload:{
                            url:messageImageUrl
                          }
                        },
                     quick_replies:fbOptions,
                     metadata:metaData 
                }
                  
              };
             
              callSendAPI(messageData);
         }
         else{
              console.log("The size of quick replies is more than 10");
         }
        
    }
    
    //text and options
    function sendTextAndOptionMessage(recipientId,metaData, messageText,options) {
        
         //prepare options
         if(Object.keys(options).length<=10){
             var fbOptions=[];
             Object.keys(options).forEach(function(key){
                 var value={
                        content_type:"text",
                        title:key,
                        payload:options[key]
                      };
                 fbOptions.push(value);
             });
         
              var messageData = {
                recipient: {
                  id: recipientId
                },
                message: {
                    text:messageText,
                     quick_replies:fbOptions,
                     metadata:metaData
                }
              };
             
             callSendAPI(messageData);
         }
         else{
              console.log("The size of quick replies is more than 10");
         }
        
    }
    
    //mark seen
    function sendMarkSeen(recipientId){
        var messageData={
                recipient:{
                            id:recipientId
                          },
                sender_action:"mark_seen"
        };
        
       callSendAPI(messageData);
    }
    
   
    
    //XXXXXX--create and send fb message structures--------------Ground Level Abstraction - 0--------------------------XXXXXXXXX
    
     //--------Peripherals------------------Out----------------------------------------------   
    
    //fb send message
    function callSendAPI(messageData) {
       // console.log("To b sent to fb : "+JSON.stringify(messageData));
        if(messageData.message&&messageData.message.quick_replies){
            for(var i=0;i<messageData.message.quick_replies.length;i++){
                if(messageData.message.quick_replies[i].payload==null){
                    messageData.message.quick_replies[i].payload="";
                }
            }
        }
        
      request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token:token },
        method: 'POST',
        json: messageData

      }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var recipientId = body.recipient_id;
          var messageId = body.message_id;
           // console.log("Message successfully sent");
          //console.log("Successfully sent generic message with id %s to recipient %s "+JSON.stringify(messageData), messageId, recipientId);
        } else {
            
            console.log("Message not sent"+error);
           //console.error("Unable to send message to $$$$$$$$"+JSON.stringify(messageData)+" "+messageData.recipient.id);
          // console.error(response.body.error.message);
        //  // console.error(error);
        }
      });  
    }
 
    //xxx-----Peripherals------------------Out-----------------------------------------xxxx
       
    //XXXXXXX---------------------------------------------------Output-----------------------------------------------XXXXXXXXXXX
 