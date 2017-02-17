//user defined dependencies
var FlowDesigner = require("../build/flowdesigner");

module.exports = function(router){

    //post - create chatlets
    router.post('/chatlet/create',function(req,res){
            if(FlowDesigner.buildChatlet(req.body)){
                res.status(200).send("Done");
            }
            else{
                res.status(200).send("Not Done");
            }
        });
  
 
    //post - create flow
    router.post('/flow/create',function(req,res){
        if(FlowDesigner.buildFlow(req.body)){
            res.status(200).send("Done");
        }
        else{
            res.status(200).send("Not Done");
        }
        
    });
    
    
    return router;
    
}