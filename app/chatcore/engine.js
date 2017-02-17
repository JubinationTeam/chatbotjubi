//import dependencies
var request = require("request");
var replaceAll = require("replaceall");
var Tokenizer = require('sentence-tokenizer');

//import database models
var Chatlet = require('../models/chatlet');
var Users = require('../models/users');
var Conversations = require('../models/conversations');
var Dashbot = require('../models/dashbot');



var Helper = require("../custom/helper");
var Facebook = require("../facebook/process");




var lineBreak=10;

module.exports.getNextChatletResponse=function(mediaType,chatletTag,startId){
    
    getNext(mediaType,chatletTag,startId);
    
}

//-------------------------------Engine In--------------------------------------------
function getNext(mediaType,chatletTag,startId){
      if(!chatletTag.chatletId||chatletTag.chatletId==null||chatletTag.chatletId==""||chatletTag.chatletId==="start"){
      
        sendFirstChatlet(mediaType,startId,chatletTag);
    }
    else{
       // console.log(JSON.stringify(chatletTag));
          sendRestChatlet(mediaType,chatletTag);
                
    }
}
function sendFirstChatlet(mediaType,startId,chatletTag){
  //  console.log("----------First----------");
    Chatlet.findById(startId).exec().then(function (chatlet) {
                if(!chatlet||chatlet==null){
                    console.log("Something went wrong while searching chatlet "+startId+":"+JSON.stringify(chatlet));
                }
                else{
                   // console.log("Fetched chatlet "+startId+":"+JSON.stringify(chatlet));
                    buildAndSendChatletResponse(mediaType,chatlet,chatletTag.userId);
                }
        });
}
function sendRestChatlet(mediaType,chatletTag){
    
   // console.log("----------Rest----------");
    //Find present chatlet
    Chatlet.findById(chatletTag.chatletId).exec().then(function (chatlet) {
            if(!chatlet||chatlet==null){
                console.log("Such a chatlet do not exist, chatlet - "+chatletTag.chatletId)
            }
            else{
                  switch(chatlet.answerType){
                        //STC,TVC,TDC
                        case "text":

                                        //TDC and STC
                                        if(!chatlet.validationBlock){
                                         //   console.log("STCAndTDC");
                                                sendSTCAndTDC(mediaType,chatlet, chatletTag);

                                        }
                                        //TVC
                                        else{

                                         //   console.log("TVC");
                                                sendTVC(mediaType,chatlet,chatletTag);
                                                // System.out.println("TVC:");
                                        }
                            break;
                        //COC,SOC,ODC
                        case "option":


                                    //SOC,ODC-Non Conditional
                                        if(!chatlet.conditionBlock){

                                        //    console.log("SOCAndODC");
                                            sendSOCAndODC(mediaType,chatlet, chatletTag);
                                        }
                                        //COC-Conditonal
                                        else{

                                        //    console.log("COC");
                                            sendCOC(mediaType,chatlet, chatletTag);
                                            // System.out.println("COC:");
                                        }
                            break;
                        //SHC
                        case "text-option":

                                       //     console.log("SHC");
                                            sendSHC(mediaType,chatlet,chatletTag);
                            break;
                        default:
                                            console.log("Chatlet with undefined answerType");
                                            chatlet=null;
                            break; 
                    }     
            }
        
        
        
    });
}
//XXXXXX--------------------------Engine In--------------------------------------XXXXXXXXX

//-------------------------------Engine Process--------------------------------------------
function sendCOC(mediaType,chatlet, chatletTag){
  //  console.log("----------COC----------");
    chatletTag.tag=chatletTag.answer;
    var options = Object.keys(chatlet.options);
    var valid=false;
    for(var i=0;i<options.length;i++){
            if(chatletTag.answer===options[i]){
                valid=true;
            }
       }
    var nextChatletId=chatlet.options[chatletTag.answer];
    updateUserValidateAndSendOptionalChatlet(valid,false,nextChatletId,mediaType,chatlet,chatletTag);
}
function sendSOCAndODC(mediaType,chatlet, chatletTag){
    //    console.log("---------SOC|ODC----------");
        chatletTag.tag=chatletTag.answer;
        var options = Object.keys(chatlet.options);
        var valid=false;
        for(var i=0;i<options.length;i++){
                if(chatletTag.answer===options[i]){
                    valid=true;
                }
           }
        //validating option
        //ODC
        if(chatlet.deciders&&chatlet.deciders!=null&&chatlet.deciders.length>0){
            var nextChatletId=chatlet.options[chatletTag.answer];
            if(!nextChatletId||nextChatletId==null){
                nextChatletId=chatlet.next;
            }
            updateUserValidateAndSendOptionalChatlet(valid,true,nextChatletId,mediaType,chatlet,chatletTag);
    
        }
        else{
            //SOC
            var nextChatletId=chatlet.next;
            if(nextChatletId!=null){
                updateUserValidateAndSendOptionalChatlet(valid,false,nextChatletId,mediaType,chatlet,chatletTag);
    
            }
            else{
                console.log("Chatlet id was null");
            }
        }
    
}
function sendSTCAndTDC(mediaType,chatlet,chatletTag){
    console.log("----------STC|TDC----------");
         
    if(chatlet.validationChatlets){
    var keys=Object.keys(chatlet.validationChatlets);

    if(keys.length>0){
         for(var i=0;i<keys.length;i++){
            //validating block
            var nextKey=keys[i];
            var tag=Helper.validatedText(chatlet.tagType+"-"+nextKey,chatletTag.answer);
            if(!tag||tag==null){
                var validationChatletId=chatlet.validationChatlets[nextKey];
                Chatlet.findById(validationChatletId).exec().then(function (validationChatlet) {
                    if(validationChatlet&&validationChatlet!=null){
                        if(!validationChatlet.next||validationChatlet.next==null){
                            chatlet.botMessages=validationChatlet.botMessages;
                        }
                        else{
                            chatlet=validationChatlet;
                        }
                        buildAndSendChatletResponse(mediaType,chatlet,chatletTag.userId);
                    }
                    else{
                        console.log("Something went wrong while fetching validationChatlets "+validationChatletId);
                    }
                });
                
                break;
            }
            //replace chatletTag tag with validated answer 
            chatletTag.tag=tag;
             if(i==(keys.length-1)){
                 //update user details
                updateUserAndSendTextChatlet(mediaType,chatlet,chatletTag);
                 
             }
             
        }
    }
    else{
        chatletTag.tag=chatletTag.answer; 
         //update user details
        updateUserAndSendTextChatlet(mediaType,chatlet,chatletTag);
       
    }
    }
    else{
       chatletTag.tag=chatletTag.answer;  
         //update user details
        updateUserAndSendTextChatlet(mediaType,chatlet,chatletTag);
    }
    


}
function sendTVC(mediaType,chatlet,chatletTag){
    console.log("----------TVC----------");
     //Parent
    if(!chatlet.next&&chatlet.next==null){
        Chatlet.findById(chatlet.prev).exec().then(function (workChatlet) {
            if(workChatlet&&workChatlet!=null){
                    sendSTCAndTDC(mediaType,workChatlet, chatletTag);
                }
            });
    }
    //Self
    sendSTCAndTDC(mediaType,chatlet,chatletTag);
}
function sendSHC(mediaType,chatlet,chatletTag){
   console.log("----------SHC----------");
    var keys=Object.keys(chatlet.options);
    for(var i=0;i<keys.length;i++){
       var nextKey= keys[i];
       if(nextKey==chatletTag.answer){
           sendSOCAndODC(mediaType,chatlet, chatletTag);
       }
    }
    if(nextKey!=chatletTag.answer){
        sendSTCAndTDC(mediaType,chatlet, chatletTag);
    }
}
function updateUserValidateAndSendOptionalChatlet(valid,decider,nextChatletId,mediaType,chatlet,chatletTag){
    if(valid){
        var exclude=false;
        var primary=false;
        for(var i=0;i<Helper.getTagIgnoringList().length;i++){
            if(Helper.getTagIgnoringList()[i]===chatletTag.answer){
                exclude=true;
                break;
            }
        }
        
        if(!exclude){  
            for(var i=0;i<Helper.getPrimaryInputs().length;i++){
                if(Helper.getPrimaryInputs()[i]===chatletTag.tagType){
                    primary=true;
                    break;
                }
            }
            //updating tag
            Users.findById(chatletTag.userId, function (err, userPresent) { 
                            if (err){
                                console.log("Something went wrong while searching User "+chatletTag.userId);   
                            }
                            else if(!userPresent||userPresent==null){
                                console.log("Could not find such User "+chatletTag.userId);
                            }
                            else{
                                //updating primary details
                                if(primary){
                                    userPresent[chatletTag.tagType]=chatletTag.tag;
                                }
                                if(!userPresent.tags){
                                    userPresent.tags={};
                                }
                                userPresent.tags[chatletTag.tagType]=chatletTag.tag;
                                 var query = {'_id':userPresent._id};
                                    Users.findOneAndUpdate(query, userPresent, {upsert:true}, function(err, doc){
                                        if (err){ 
                                             console.log("Could not update user", userPresent._id);
                                        }
                                        else{
                                            //work
                                      if(decider){
                                          validateAndSendOptionalDeciderChatlet(valid,nextChatletId,mediaType,chatlet,chatletTag);
                                                 }
                                        else{
                                            validateAndSendOptionalChatlet(valid,nextChatletId,mediaType,chatlet,chatletTag);
                                        }
                                        }
                                    });
                            }
            });
        }
        else{
            if(decider){  
                 validateAndSendOptionalDeciderChatlet(valid,nextChatletId,mediaType,chatlet,chatletTag);
            }
            else{
                validateAndSendOptionalChatlet(valid,nextChatletId,mediaType,chatlet,chatletTag);
            }
                                       
        }
    }
    else{
            if(decider){  
                 validateAndSendOptionalDeciderChatlet(valid,nextChatletId,mediaType,chatlet,chatletTag);
            }
            else{
                validateAndSendOptionalChatlet(valid,nextChatletId,mediaType,chatlet,chatletTag);
            }
                                       
    }

}
function updateUserAndSendTextChatlet(mediaType,chatlet,chatletTag){
        var exclude=false;
        var primary=false;
        for(var i=0;i<Helper.getTagIgnoringList().length;i++){
            if(Helper.getTagIgnoringList()[i].trim()===chatletTag.answer){
                exclude=true;
                break;
            }
        }
    
        if(!exclude){  
            for(var i=0;i<Helper.getPrimaryInputs().length;i++){
                if(Helper.getPrimaryInputs()[i].trim()===chatletTag.tagType){
                    primary=true;
                    break;
                }
            }   
            //updating tag
            Users.findById(chatletTag.userId, function (err, userPresent) { 
                            if (err){
                                console.log("Something went wrong while searching User "+chatletTag.userId);   
                            }
                            else if(!userPresent||userPresent==null){
                                console.log("Could not find such User "+chatletTag.userId);
                            }
                            else{
                                //updating primary details
                                if(primary){
                                    userPresent[chatletTag.tagType]=chatletTag.tag;
                                }
                                if(!userPresent.tags){
                                    userPresent.tags={};
                                }
                                userPresent.tags[chatletTag.tagType]=chatletTag.tag;
                                 var query = {'_id':userPresent._id};
                                    Users.findOneAndUpdate(query, userPresent, {upsert:true}, function(err, doc){
                                        if (err){ 
                                             console.log("Could not update user", userPresent._id);
                                        }
                                        else{
                                            //work
                                            var nextChatletId=chatlet.next;
                                            //TDC
                                            if(chatlet.deciders&&chatlet.deciders!=null&&chatlet.deciders.length>0){
                                                sendTextDeciderChatlet(nextChatletId,mediaType,chatlet,chatletTag);
                                            }
                                            //STC
                                            else{
                                                Chatlet.findById(nextChatletId).exec().then(function (nextChatlet) {
                                                    buildAndSendChatletResponse(mediaType,nextChatlet,chatletTag.userId);
                                                });
                                            }
                                        }
                                    });
                            }
            });
        }
    else{
            var nextChatletId=chatlet.next;
            //TDC
            if(chatlet.deciders&&chatlet.deciders!=null&&chatlet.deciders.length>0){
                sendTextDeciderChatlet(nextChatletId,mediaType,chatlet,chatletTag);
            }
            //STC
            else{
                Chatlet.findById(nextChatletId).exec().then(function (nextChatlet) {
                    buildAndSendChatletResponse(mediaType,nextChatlet,chatletTag.userId);
                });
            }
    }
   
}
function sendTextDeciderChatlet(nextChatletId,mediaType,chatlet,chatletTag){
    
    Users.findById(chatletTag.userId, function (err, userPresent) { 
                if (err){
                    console.log("Something went wrong while searching User "+chatletTag.userId);   
                }
                else if(!userPresent||userPresent==null){
                     Chatlet.findById(nextChatletId).exec().then(function (nextChatlet) {
                        buildAndSendChatletResponse(mediaType,nextChatlet,chatletTag.userId);
                     });
                    
                }
                else{
                    
                    for(var i=0;i<Helper.getUserDefinedServices().length;i++){
                        if(chatletTag.tagType==Helper.getUserDefinedServices()[i]){
                            Helper.doUserDefinedJob(userPresent,Helper.getUserDefinedServices()[i]+"$"+mediaType);
                        }
                    }
                    
                    if(userPresent.tags&&userPresent.tags!=null&&!userPresent.tags.length>0){
                        var deciderId;
                        var max=0;
                        for(var i=0;i<chatlet.deciders.length;i++){
                            var decider=chatlet.deciders[i];
                            var match=false;
                            var count=0;
                            var keys=Object.keys(decider.possibilities);
                            for(var j=0;j<keys.length;j++){
                                var key = keys[j];
                                if(key.includes("-presence")){
                                    if(
                                        ((userPresent.tags[key.split("-")[0]]
                                        &&
                                        userPresent.tags[key.split("-")[0]].length>0)
                                        &&
                                        decider.possibilities[key]==="true")
                                        ||
                                        ((!userPresent.tags[key.split("-")[0]]
                                        ||
                                        userPresent.tags[key.split("-")[0]].length<=0)
                                        &&
                                        decider.possibilities[key]==="false")
                                      ){
                                        count++;
                                        match=true;
                                    }
                                    else{
                                        count=0;
                                        match=false;
                                        break;
                                    }
                            }
                            else{
                                if(userPresent.tags[key]&&userPresent.tags[key]!=null&&userPresent.tags[key]===decider.possibilities[key]){
                                    count++;
                                    match=true;
                                }
                                else{
                                    count=0;
                                    match=false;
                                    break;
                                }
                            }    
                            }
                            if(match&&count>max){
                                            max=count;
                                            deciderId=decider.link;
                            }
                       }
                        if(deciderId){
                            Chatlet.findById(deciderId).exec().then(function (nextChatlet) {
                                buildAndSendChatletResponse(mediaType,nextChatlet,chatletTag.userId);
                             });
                        }
                        else{   
                             Chatlet.findById(nextChatletId).exec().then(function (nextChatlet) {
                                buildAndSendChatletResponse(mediaType,nextChatlet,chatletTag.userId);
                             });
                        }
                    }
                    else{
                         Chatlet.findById(nextChatletId).exec().then(function (nextChatlet) {
                            buildAndSendChatletResponse(mediaType,nextChatlet,chatletTag.userId);
                         });
                    }
                }
        
        });
}
function validateAndSendOptionalDeciderChatlet(valid,nextChatletId,mediaType,chatlet,chatletTag){
        
        Users.findById(chatletTag.userId, function (err, userPresent) { 
                if (err){
                    console.log("Something went wrong while searching User "+chatletTag.userId);   
                }
                else if(!userPresent||userPresent==null){
                    validateAndSendOptionalChatlet(valid,nextChatletId,mediaType,chatlet,chatletTag);
                }
                else{
                       for(var i=0;i<Helper.getUserDefinedServices().length;i++){
                        if(chatletTag.tagType==Helper.getUserDefinedServices()[i]){
                            Helper.doUserDefinedJob(userPresent,Helper.getUserDefinedServices()[i]+"$"+mediaType);
                        }
                    }
                    if(userPresent.tags&&userPresent.tags!=null&&!userPresent.tags.length>0){
                        var deciderId;
                        var max=0;
                        for(var i=0;i<chatlet.deciders.length;i++){
                            var decider=chatlet.deciders[i];
                            var match=false;
                            var count=0;
                            var keys=Object.keys(decider.possibilities);
                            for(var j=0;j<keys.length;j++){
                                var key = keys[j];
                                if(key.includes("-presence")){
                                    if(
                                        ((userPresent.tags[key.split("-")[0]]
                                        &&
                                        userPresent.tags[key.split("-")[0]].length>0)
                                        &&
                                        decider.possibilities[key]==="true")
                                        ||
                                        ((!userPresent.tags[key.split("-")[0]]
                                        ||
                                        userPresent.tags[key.split("-")[0]].length<=0)
                                        &&
                                        decider.possibilities[key]==="false")
                                      ){
                                        count++;
                                        match=true;
                                    }
                                    else{
                                        count=0;
                                        match=false;
                                        break;
                                    }
                            }
                            else{
                                if(userPresent.tags[key]&&userPresent.tags[key]!=null&&userPresent.tags[key]===decider.possibilities[key]){
                                    count++;
                                    match=true;
                                }
                                else{
                                    count=0;
                                    match=false;
                                    break;
                                }
                            }    
                            }
                            if(match&&count>max){
                                            max=count;
                                            deciderId=decider.link;
                            }
                       }
                        if(deciderId){
                            validateAndSendOptionalChatlet(valid,deciderId,mediaType,chatlet,chatletTag);
                        }
                        else{    
                            validateAndSendOptionalChatlet(valid,nextChatletId,mediaType,chatlet,chatletTag);
                        }
                    }
                    else{
                        validateAndSendOptionalChatlet(valid,nextChatletId,mediaType,chatlet,chatletTag);
                    }
                }
        
        });
    
}
function validateAndSendOptionalChatlet(valid,nextChatletId,mediaType,chatlet,chatletTag){
    
     //validating option
    if(valid){
         Users.findById(chatletTag.userId, function (err, userPresent) { 
             if (err){
                    console.log("Something went wrong while searching User "+chatletTag.userId);   
                }
                else if(userPresent&&userPresent!=null){
                    for(var i=0;i<Helper.getUserDefinedServices().length;i++){
                        if(chatletTag.tagType==Helper.getUserDefinedServices()[i]){
                            Helper.doUserDefinedJob(userPresent,Helper.getUserDefinedServices()[i]+"$"+mediaType);
                        }
                    }
                }
         });
         Chatlet.findById(nextChatletId).exec().then(function (nextChatlet) {
                if(!nextChatlet||nextChatlet==null){
                    console.log("Something went wrong while searching chatlet "+nextChatletId);
                }
                else{
                    buildAndSendChatletResponse(mediaType,nextChatlet,chatletTag.userId);
                }
            });
    }
    //send prev chatlet again if not validated
    else{
        var defaultMessage =Helper.getDefaultReplyForInvalidAnswer()[random(Helper.getDefaultReplyForInvalidAnswer.length-1)];
       // console.log(defaultMessage);
        for(var i=0;i<chatlet.botMessages.length;i++){
            chatlet.botMessages[i].messages[0].value=defaultMessage+" "+chatlet.botMessages[i].messages[0].value;
        }
         buildAndSendChatletResponse(mediaType,chatlet,chatletTag.userId);
    }
}
//XXXXXX-------------------------------Engine Process---------------------------XXXXXXXXXXXXXXXX

//------------------------------Engine out--------------------------------------------
function buildAndSendChatletResponse(mediaType,chatlet,userId){
    var messages=[];
    if(chatlet){
        var botMsg=chatlet.botMessages[random(chatlet.botMessages.length)].messages;
    if(botMsg){
            for(var i=0;i<botMsg.length;i++){
                
                if(botMsg[i].type==="text"){
                    
                  //  var arrayMessages=botMsg[i].value.match(/\S.*?\."?(?=\s|$)/g);//change
                    var tokenizer = new Tokenizer('Bot');
                    tokenizer.setEntry(botMsg[i].value);
                    var arrayMessages=tokenizer.getSentences();
                    var value="";
                    if(arrayMessages&&arrayMessages!=null&&arrayMessages.constructor === Array&&arrayMessages.length>0){
                     //   console.log("array:::::::::::::::::::"+arrayMessages);
                       for(var j=0;j<arrayMessages.length;j++){

                            if(value.length<lineBreak&&arrayMessages[j].length<lineBreak){
                                value+=" "+arrayMessages[j];
                                if(j==arrayMessages.length-1){
                                    messages.push({type:"text",value:value});
                                    value="";
                                }
                            }
                            else if(value!=""){
                               messages.push({type:"text",value:value});
                                value="";
                            }
                            else{
                               messages.push({type:"text",value:arrayMessages[j]}); 
                            }

                        }
                    }else{
                        messages.push(botMsg[i]);
                        
                    }
                    
                }
                else{
                    messages.push(botMsg[i]);
                }
                
            }
        
        
    }
        
      //  console.log("messages:::::::::::::::::::"+JSON.stringify(messages));
                  
        var chatletResponse={
            chatletId:chatlet._id,
            answerType:chatlet.answerType,
            options:chatlet.options,
            tagType:chatlet.tagType,
            botMessage:messages
        };
        saveConversation(chatletResponse);
        doDynamicLinkingAndSend(mediaType,chatletResponse,userId);
       // sendOut(mediaType,chatletResponse,userId);
    }
    else{
        console.log("Error in building chatlet response");
    }
}
function doDynamicLinkingAndSend(mediaType,chatletResponse,userId){
        Users.findById(userId, function (err, userPresent) { 
                if (err){
                    console.log("Something went wrong while searching User "+chatletTag.userId);   
                }
                else{
                    //dynamic linking
                    for(var i=0;i<chatletResponse.botMessage.length;i++){
                        var text=chatletResponse.botMessage[i].value;
                        
                        if(text&&text!=null){
                            text=replaceAll("[<>]", "",text);
                            while(text.includes("[")&&text.includes("<")&&text.includes(">")&&text.includes("]")){

                                        var preTagText="";
                                        var postTagText="";

                                        //pre
                                        var preText=text.split("[")[0];
                               

                                        //pretag
                                        if(text.split("<")[0].charAt(text.split("<")[0].length-1)=='['){
                                            preTagText="";
                                        }else{
                                         preTagText=text.split("<")[0].split("[")[1];

                                        }
                                    //tag
                                        var tag=text.split("]")[0].split("[")[1].split(">")[0].split("<")[1];

                                    //posttag
                                     if(text.split("]")[0].charAt(text.split("]")[0].length-1)=='>'){
                                            postTagText="";
                                        }else{
                                         postTagText=text.split("]")[0].split(">")[1];
                                        }

                                    //post
                                       var postText="";
                                       var index=text.indexOf("]");

                                       if(index>=0&&(index<text.length-1)){
                                            postText=text.substring(index+1);
                                       }
                                       else{
                                           text=replaceAll("]", "",text);
                                       }

                                      var value="";
                                //user values
                                      if(userPresent&&userPresent!=null){
                                        if(userPresent[tag]&&userPresent[tag]!=null){
                                                value=userPresent[tag];
                                        }
                                          //tag values
                                          else if(userPresent.tag&&userPresent.tag!=null &&userPresent.tag[tag]&&userPresent.tag[tag]!=null){
                                            value=userPresent.tag[tag];
                                          }
                                      //result values
                                      else if(userPresent.result&&userPresent.result!=null &&userPresent.result[tag]&&userPresent.result[tag]!=null){
                                            value=userPresent.result[tag];
                                          }
                                          //images random
                                          else if(tag.includes("image")){
                                              var keys=Object.keys(Helper.getUserDefinedSizes());
                                              for(var j=0;j<keys.length;j++){
                                                  if(keys[j]==tag){
                                                 //   console.log(keys[j]+"::::::::::::"+Helper.getUserDefinedSizes()[tag]);
                                                      if(Helper.getUserDefinedSizes()[tag]>0){
                                                        value=random(Helper.getUserDefinedSizes()[tag]);
                                                      }
                                                      else{
                                                        value=Helper.getUserDefinedSizes()[tag];  
                                                      }
                                                  }
                                              }
                                          } 
                                      }
                                
                                      if(value&&value!=null&&value!==""){
                                            value=preTagText+value+postTagText;
                                      }
        
                                text=preText+value+postText;
                                      // System.out.println(text+"||||||||||||||||"+tag);

                        }
                           // console.log(":::::::::::::::"+text);
                            chatletResponse.botMessage[i].value=text;
                        }
                    }

                    sendOut(mediaType,chatletResponse,userId);
        }
});
}
function sendOut(mediaType,chatletResponse,userId){
  
     switch(mediaType){
            case "fb":Facebook.sendChatletResponseOut(chatletResponse,userId);
             break;
            case "web":console.log("Engine settings not done yet");
             break;
            default:console.log("Not a valid option");
             break;
        }
}
function saveConversation(chatletResponse){
    if(chatletResponse&&chatletResponse!=null){
        var message="";
        for(var i=0;i<chatletResponse.botMessage.length;i++){
            message+=chatletResponse.botMessage[i].value;
        }
        var conversation={
                userId:chatletResponse.userId,
                tag:chatletResponse.tag,
                answer:message,
                answerType:chatletResponse.answerType,
                tagType:chatletResponse.tagType,
                chatletId:chatletResponse.tagType,
                sessionId:chatletResponse.sessionId,
                fbId:chatletResponse.fbId
        };
        new Conversations(conversation).save(function(error){
                    if(error){
                        console.log("Something went wrong while adding Conversation "+conversation.chatletId+":"+error);
                    }
                    else{
                      //  console.log("Conversation added "+conversation.chatletId);
                    }
            });
    }
}
function random (length) {
            return parseInt(Math.random()*parseInt(length));
        }
//XXXXXXX-----------------------Engine out------------------------------XXXXXXXXXXXXXX
