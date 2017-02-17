

//import custom dependencies
var FaceBookIn = require('../facebook/in');


module.exports = function(router){
    
    //~~~~~---------------------------------------------------/Input/-----------------------------------------------~~~~~~~~~~
    
    //--------Peripherals------------------In----------------------------------------------
    
    //get - fb authentication - should always return 200
    router.get('/', function(req, res) {
          if (req.query['hub.mode'] === 'subscribe' &&
          req.query['hub.verify_token'] === "7129") {
        console.log("Validating webhook");
        res.status(200).send(req.query['hub.challenge']);
      } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);          
      }  
    });

    //post - fb receive message
    router.post('/',function (req, res) {
      var data = req.body;
      // Make sure this is a page subscription
      if (data.object === 'page') {
        // Iterate over each entry - there may be multiple if batched
        data.entry.forEach(function(entry) {
          var pageID = entry.id;
          var timeOfEvent = entry.time;
          // Iterate over each messaging event
          entry.messaging.forEach(function(event) {
              
                FaceBookIn.receivedMessage(event);
           
          });
        });
        res.sendStatus(200);
      }
    });

    //xxx-----Peripherals------------------In-----------------------------------------xxxx
    
   
    //XXXXXXX---------------------------------------------------Input-----------------------------------------------XXXXXXXXXXX
 
    return router;
}