//import dependencies
var request = require("request");

//set variables
//var selfFbId="1507134892909302";//nearbuystuff
var selfFbId="1429336680449535";//jubination
var startId="start0"
var token="EAATGe4nRRiQBAEPo6cggvl0ciRSCUvahT4VbNLvMcDwT1NCsAn5ZCVFjvmoZA9GSCpJLqpzvScgYOWAOOuUZC1vulRLvKIMqtZBNoqGmC9vXnECjxvXFhv0lmRiLrZBeV31sr7mFGGBHysK2C0cHoW7wvWI4deROZBe9wh2fJJhgZDZD";





//fb send get started
    module.exports.sendGetStartedMessage=function() {
     var messageData={
          setting_type:"call_to_actions",
          thread_state:"new_thread",
          call_to_actions:[
            {
              payload:"GET_STARTED$option$getStarted"
            }
          ]
        };    
        
      request({
        uri: 'https://graph.facebook.com/v2.6/me/thread_settings',
        qs: { access_token:token },
        method: 'POST',
        json: messageData

      }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("Get started Set : Facebook Responded with "+response.body.result);
        } else {
            console.log("Get Started set up Failed"+err);
        }
      });  
    }
    
    module.exports.getToken=function(){
        return token;
    }
    
    module.exports.getSelfId=function(){
        return selfFbId;
    }
    
    module.exports.getStartId=function(){
        return startId;
    }