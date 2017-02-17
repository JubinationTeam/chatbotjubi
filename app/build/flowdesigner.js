//database models
var Chatlet = require('../models/chatlet');

module.exports.buildChatlet=function(chatlet){
    new Chatlet(req.body).save(function(err){
            if(err){
                console.log("Something went wrong while adding Chatlet "+err);
            }
            else{
                console.log("Chatlet added");
            }
        });
    return true;
}


module.exports.buildFlow=function(flow){
    var prefix = flow.prefix;
        var override=flow.override;
        for(var i=0; i<flow.chatlets.length; i++){
            var chatlet=flow.chatlets[i].chatlet;
            switch (flow.chatlets[i].type) {
                case "STC": chatlet.answerType="text";
                            saveChatlet(chatlet, prefix,override);
                    break;
                case "TVC": chatlet.answerType="text";
                            chatlet.validationBlock=true;
                            saveChatlet(chatlet, prefix,override);
                    break;
                case "TDC": chatlet.answerType="text";
                            saveChatlet(chatlet, prefix,override);
                    break;
                case "SOC": chatlet.answerType="option";
                            saveChatlet(chatlet, prefix,override);
                    break;
                case "ODC": chatlet.answerType="option";
                            saveChatlet(chatlet, prefix,override);
                    break;
                case "COC": chatlet.answerType="option";
                            chatlet.conditionBlock=true;
                            saveChatlet(chatlet, prefix,override);
                    break;
                case "SHC": chatlet.answerType="text-option";
                            saveChatlet(chatlet, prefix,override);
                    break;
                default:    console.log("Undefined answerType, Presuming 'text' as default");
                            chatlet.answerType="text";
                            saveChatlet(chatlet, prefix,override);
                    break;
            }
    }

    return true;
}


function saveChatlet(chatlet, prefix,override){
        if(chatlet._id!=null&&chatlet._id!=undefined){
            chatlet._id=prefix+chatlet._id;
            if(!chatlet.next!=null&&chatlet.next!=undefined){
                chatlet.next=prefix+chatlet.next;
            }
            if(chatlet.prev!=null&&chatlet.prev!=undefined){
                chatlet.prev=prefix+chatlet.prev;
            }
            if(chatlet.options!=null&&chatlet.options!=undefined){
                var keysOption = Object.keys(chatlet.options);
                for(var j=0;j<keysOption.length;j++){ 
                    if(chatlet.options[keysOption[j]]!=null&&chatlet.options[keysOption[j]]!=undefined){
                        chatlet.options[keysOption[j]]=prefix+chatlet.options[keysOption[j]];
                    }
                }
            }
            
            if(chatlet.validationChatlets!=null&&chatlet.validationChatlets!=undefined){
                var keysValidate = Object.keys(chatlet.validationChatlets);
                for(var l=0;l<keysValidate.length;l++){
                    if(chatlet.validationChatlets[keysValidate[l]]!=null&&chatlet.validationChatlets[keysValidate[l]]!=undefined){
                        chatlet.validationChatlets[keysValidate[l]]=prefix+chatlet.validationChatlets[keysValidate[l]];
                    }
                }
            }
            if(chatlet.deciders!=null&&chatlet.deciders!=undefined){
                for(var k=0;k<chatlet.deciders.length;k++){
                    chatlet.deciders[k].link=prefix+chatlet.deciders[k].link;
                }
            }
            if(override){
                deleteChatletById(chatlet._id);
            }
            new Chatlet(chatlet).save(function(err){
                                        if(err){
                                            console.log("Something went wrong while adding Chatlet "+chatlet._id+":"+err);
                                        }
                                        else{
                                            console.log("Chatlet added "+chatlet._id);
                                        }
                                });
        }
    }
    
    function deleteChatletById(chatletId){
       Chatlet.findByIdAndRemove(chatletId, function(err) {
            if (err) {
                console.log("Something went wrong while deleting Chatlet "+chatletId+":"+err);   
            }
            
        });
    }
    