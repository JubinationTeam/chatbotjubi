//import dependencies
var replaceAll = require("replaceall");

//db dependencies
var Metadata = require('../models/metadata');

//import custom dependencies
var FaceBookOut = require('./out');
var CoreProcess = require("../chatcore/engine")
var start = require("./start")

    
    //~~~~~---------------------------------------------------/Process/-----------------------------------------------~~~~~~~~~~
    //send message to chatcore engine
    module.exports.processUserReply=function(userId,message){
        

        var nextChatletId;
        var lastAnswer;
        var prevChatlet
        var prevChatletTag;
        var messageId=message.mid;
        
        //option select COC,SHC,ODC,SOC
            if(message.quick_replies){
                lastAnswer=Object.keys(mediaJson.quick_replies)[0];
            }
            //text select SHC STC TVC
            else{
                lastAnswer=message.text;
            }
    
          
      
           prevChatletTag={
                 userId:"fb$"+userId,
                 answer:lastAnswer,
                 fbId:userId,
                 sessionId:"fb$"+userId,
                 tag:""

             } 
        
         Metadata.findById("fb$"+userId, function (err, metadataPresent) {
             if(err){
                    console.log("Something went wrong in fetching metadata fb$"+userId);
                    
             }
             else if(!metadataPresent||metadataPresent==null){
                 CoreProcess.getNextChatletResponse("fb",prevChatletTag,start.getStartId());
             }
             else{
                 var metadataPresentArray=metadataPresent.value.split("$");
                 prevChatletTag.chatletId=metadataPresentArray[0];
                 prevChatletTag.answerType=metadataPresentArray[1];
                 prevChatletTag.tagType=metadataPresentArray[2];
                 CoreProcess.getNextChatletResponse("fb",prevChatletTag,start.getStartId());
             }
         });
        
        
        
       
    }
    
    
//engine's response
     module.exports.sendChatletResponseOut=function(nextChatletResponse,userId){
             userId=userId.split("$")[1];
             if(nextChatletResponse&&nextChatletResponse!=null){
                 for(var i =0;i<nextChatletResponse.botMessage.length;i++){
                    nextChatletResponse.botMessage[i].value=replaceAll("<b>","",nextChatletResponse.botMessage[i].value);
                    nextChatletResponse.botMessage[i].value=replaceAll("</b>","",nextChatletResponse.botMessage[i].value);
                     nextChatletResponse.botMessage[i].value=replaceAll("<u>","",nextChatletResponse.botMessage[i].value);
                    nextChatletResponse.botMessage[i].value=replaceAll("</u>","",nextChatletResponse.botMessage[i].value);
                    nextChatletResponse.botMessage[i].value=replaceAll("<br/>","",nextChatletResponse.botMessage[i].value);
                 }
                FaceBookOut.sendChatletResponse(nextChatletResponse,userId);
            }
            else{
                console.log("Chat Engine reported an error")
            }
    }

    //XXXXXXX---------------------------------------------------Process-----------------------------------------------XXXXXXXXXXX
    
    
    
