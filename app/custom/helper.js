//import dependencies
var request = require("request");
var emailValidator= require("email-validator");
var date = require('date-and-time');


var Users = require('../models/users');

var ignoringTagList=["I want to answer this later","Skip for now"];
var primaryInputs=["name","email","phone","country","gender"];
var userDefinedServices=["result"];
var defaultReplyForInvalidAnswer=["I dont understand that.",
                                  "Will surely help you with that in sometime. Can you please let me know the details as of now?",
                                  "Can't help you with this now. Please help me with the details."
                                 ];
var userDefinedSizes={
    imageQuote:16,
    imageStress:3,
    imageHabits:4,
    imageDrinkAdvice:0
}





module.exports.getDefaultReplyForInvalidAnswer=function(){
    return defaultReplyForInvalidAnswer;
}

module.exports.getTagIgnoringList=function(){
    return ignoringTagList;
}
module.exports.getPrimaryInputs=function(){
    return primaryInputs;
}

module.exports.getUserDefinedServices=function(){
    return userDefinedServices;
}

module.exports.getUserDefinedSizes=function(){
    return userDefinedSizes;
}


module.exports.doUserDefinedJob=function(user,value){
   
    switch(value){
        case "result$fb":  
                        console.log("::::result fb");
                        var overweightText="You are over-weight,";
                        var exerciseText="You don't exercise regularly,";
                        var smokeText="Your habit of smoking, ";
                        var drinkText="Your habit of alcohol consumption, ";
                        var ageText="Your age is in the high risk-group, ";
                        var thyroidText=" <b>Thyroid</b>: Also your gender pre-disposes you to Thyroid and other hormonal conditions";
                        var gender=false;
                        var smoke =false;
                        var drink=false;
                        var exercise=false;
                        var heartFlag=false;
                        var diabetesFlag=false;
                        var checkup=false;
                        var overweight=false;
                        var waistFat=false;
                        var stressed=false;
                        var aged=false;

                        var diabetesCount=0;
                        var heartCount=0;
                        var liverCount=0;
                        var kidneyCount=0;
                        var vitaminCount=0;

                        var diabetes="";
                        var heart="";
                        var kidney="";
                        var liver="";
                        var vitamin="";
                        var healthGoals1="";
                        var healthGoals2="";
                        var healthGoals3="";
                        var healthGoals4="";
                        var healthGoals5="";
                        var healthGoals6="";
                        var healthGoals7="";
                        var healthGoals8="";
                        var risk="";


                        var diabetesPreText="<b>Diabetes</b>: You have ";
                        var heartPreText="<b>Heart Diseases</b>: You have ";
                        var kidneyPreText="<b>Chronic Kidney Diseases</b>: You have ";
                        var liverPreText="<b>Chronic Liver Deiseases</b>: You have ";
                        var vitaminPreText="<b>Vitamin D and Vitamin B12 Deficiencies</b>: You have ";
                        var midText=" risk-factors : ";
                      //  var link = "<a href='https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fjubination.com%2FMiaWellness%2F&src=sdkpreparse' target='_blank'>Share on Facebook</a> or  "
                //  +"<a href='whatsapp://send?text=Wellness is happiness And now you can generate a customized wellness plan for FREE - tailor-made just for you  Mia can help you be proactive about health and thus avoid illness & healthcare-related costs' data-action='share/whatsapp/share'>Share via Whatsapp</a>";
                        var link="on facebook and whatsapp"
        
            if(!user.result||user.result==null){
                user.result={};
            }
            if(!user.triggers||user.triggers==null){
                user.triggers={};
            }
                        //BMI
        var height=user.tags["height"];
        var weight=parseFloat(user.tags["weight"]);
        var waistSize=parseFloat(user.tags["waistSize"]);
        var age=parseFloat(user.tags["age"]);
         
        var heightMeters=0.0;
            
        if(height.split(".").length>=2){
           heightMeters= parseFloat(height.split(".")[0])*0.3048+parseFloat(height.split(".")[1])*0.0254;
        }
        else{
             heightMeters= parseFloat(height)*0.3048;
        }
        var bmi = parseFloat(weight)/(Math.pow(heightMeters,2));
        
        //AGED
        aged=(age>=40);
        
        //GENDER
            if(user.tags["gender"]&&user.tags["gender"]!=null){
                gender=(user.tags["gender"].trim()=="male"||user.tags["gender"].trim()=="Male");
            }
            else{
               gender=(user.gender.trim()=="male"||user.gender.trim()=="Male"); 
            }
          
        
        //WAIST
        waistFat=(gender&&waistSize>37)||(!gender&&waistSize>31.5);
        
        //HABITS
        drink=(user.tags["habits"].includes("drink")||user.tags["habits"].includes("alcohol")||user.tags["habits"].includes("both"))
        
        smoke=(user.tags["habits"].includes("smoke")||(user.tags["habits"].includes("both")));
         
        //EXERCISE
        exercise=(user.tags["exercise"].trim()=="yes"||user.tags["exercise"].trim()=="Yes");
        
        //ILLNESS
        heartFlag=(user.tags["illness"].includes("Heart")||user.tags["illness"].includes("both"));
            
       diabetesFlag=(user.tags["illness"].includes("Diabetes")||user.tags["illness"].includes("both"));
            
       
        //STRESS
        var stress=0;
        if(user.tags["stress"].trim()=="high"||user.tags["stress"].trim()=="High"){
            stress+=2;
        }
        else if(user.tags["stress"].trim()=="manageable"||user.tags["stress"].trim()=="Manageable"){
            stress+=1;
        }
        stressed=stress>0;
        
        
        //CHECKUP
        checkup=(user.tags["checkup"].trim()=="yes"||user.tags["stress"].trim()=="Yes");
        
        //OVERWEIGHT
        overweight=(bmi>=25);
        
       //RISKS
        if(overweight){
            vitamin+=overweightText;
            vitaminCount++;
            liver+=overweightText;
            liverCount++;
            diabetes+=overweightText;
            diabetesCount++;
            heart+=overweightText;
            heartCount++;
        }
        
        if(aged){
            diabetes+=ageText;
            diabetesCount++;
            heart+=ageText;
            heartCount++;
        }
        
        if(smoke){
            diabetes+=smokeText;
            diabetesCount++;
            heart+=smokeText;
            heartCount++;
            liver+=smokeText;
            liverCount++;
            kidney+=smokeText;
            kidneyCount++;
            
        }
         if(drink){
            diabetes+=drinkText;
            diabetesCount++;
            heart+=drinkText;
            heartCount++;
            liver+=drinkText;
            liverCount++;
            kidney+=drinkText;
            kidneyCount++;
        }
         
         if(!exercise){
            diabetes+=exerciseText;
            diabetesCount++;
            heart+=exerciseText;
            heartCount++;
        }
         
        
         //Health Goals
          if(waistFat||overweight){
                healthGoals1="Manage your <b>Weight</b> - With this one step, we can reverse a lot of your health-risks. <br/><br/>";
            }
          if(stressed){
               healthGoals2="Manage your <b>Stress-Levels</b> - Stress affects our mind, body and productivity, I will help you manage stress better. <br/><br/>";
          }
          if(!checkup){
              healthGoals3="Opt for a <b>Comprehensive Health-checkup</b> - I will also tell you the exact package you require. <br/><br/>";
          }
           if(heartFlag||diabetesFlag){
               var illness="";
               if(heartFlag){
                   illness+="Heart";
               }
               if(heartFlag&&diabetesFlag){
                   illness+=" and ";
               }
               if(diabetesFlag){
                   illness+="Diabetes";
               }
              healthGoals4="Get into a regular regime of <b>Managing your Health condition</b> - "+illness+". <br/><br/>";
          }
           if(!exercise){
               healthGoals5="Start getting <b>Physically active.</b>  <br/><br/>";
           }
            healthGoals6=" Get into a regime of <b>Eating healthy</b> - I will get my experts involved and suggest what's right. <br/><br/>";

            if(smoke){
                 healthGoals7=" Quit <b>Smoking</b> - You would have read the warnings I am sure, still. <br/><br/>";
            }
           if(drink){
                    healthGoals8=" Moderate <b>Alcohol intake. </b> <br/><br/>";
           }
           
         risk="<br/> "+diabetesPreText+diabetesCount.toString()+midText+diabetes+"<br/>";
         risk=risk+"<br/> "+heartPreText+heartCount.toString()+midText+heart+"<br/>";
         risk=risk+"<br/> "+liverPreText+liverCount.toString()+midText+liver+"<br/>";
         risk=risk+"<br/> "+kidneyPreText+kidneyCount.toString()+midText+kidney+"<br/>";
         risk=risk+"<br/> "+vitaminPreText+vitaminCount.toString()+midText+vitamin+"<br/>";
         
           if(!gender){
               user.result["thyroid-text"]= thyroidText;
                risk=risk+"<br/>"+thyroidText+"<br/>";
         
           }
           if(smoke&&drink){
               user.result["number-checkup"]="<b>1 out of 6</b>";
           user.result["number-phy"]="<b>2 out of 6</b>";
            user.result["number-diet"]="<b>3 out of 6</b>";
            user.result["number-smoke"]="<b>4 out of 6</b>";
            user.result["number-drink"]="<b>5 out of 6</b>";
            user.result["number-med"]="<b>6 out of 6</b>";
           }
           else if(smoke){
               user.result["number-checkup"]="<b>1 out of 5</b>";
           user.result["number-phy"]="<b>2 out of 5</b>";
            user.result["number-diet"]="<b>3 out of 5</b>";
            user.result["number-smoke"]="<b>4 out of 5</b>";
            user.result["number-med"]="<b>5 out of 5</b>";
            }
           else if(drink){
            user.result["number-checkup"]="<b>1 out of 5</b>";
           user.result["number-phy"]="<b>2 out of 5</b>";
            user.result["number-diet"]="<b>3 out of 5</b>";
            user.result["number-drink"]="<b>4 out of 5</b>";
            user.result["number-med"]="<b>5 out of 5</b>";
           }
           else{
                user.result["number-checkup"]="<b>1 out of 4</b>";
                user.result["number-phy"]="<b>2 out of 4</b>";
                user.result["number-diet"]="<b>3 out of 4</b>";
                user.result["number-med"]="<b>4 out of 4</b>";
           }
           
            user.result["diabetes-text"]= diabetes;
            user.result["heart-text"]= heart;
            user.result["kidney-text"]= kidney;
            user.result["liver-text"]= liver;
            user.result["vitamin-text"]= vitamin;
            user.result["name-of-tests"]="<br/> <b>Diabetes</b><br/><br/> <b>Lipid Profile</b><br/><br/> <b>Liver Profile</b><br/><br/> <b>Kidney Profile</b><br/><br/>";
            user.result["diabetes-count"]=diabetesCount;
            user.result["heart-count"]=heartCount;
            user.result["kidney-count"]=kidneyCount;
            user.result["liver-count"]=liverCount;
            user.result["vitamin-count"]=vitaminCount;
            user.result["risk-text"]=risk;
            user.result["share-link"]=link;
            user.result["health-goals-1"]=healthGoals1;
            user.result["health-goals-2"]=healthGoals2;
            user.result["health-goals-3"]=healthGoals3;
            user.result["health-goals-4"]=healthGoals4;
            user.result["health-goals-5"]=healthGoals5;
            user.result["health-goals-6"]=healthGoals6;
            user.result["health-goals-7"]=healthGoals7;
            user.result["health-goals-8"]=healthGoals8;
            
            user.triggers["gender"]=gender;
            user.triggers["smokes"]=smoke;
            user.triggers["drinks"]=drink;
            user.triggers["exercises"]=exercise;
            user.triggers["heart"]=heartFlag;
            user.triggers["diabetes"]=diabetesFlag;
            user.triggers["checkup"]=checkup;
            user.triggers["overweight"]=overweight;
            user.triggers["waistSize"]=waistFat;
            user.triggers["stressed"]=stressed;
            user.triggers["aged"]=aged;
            
            if(smoke){
                user.tags["smoke"]="true";
            }
            else{
                user.tags["smoke"]="false";
            }
            if(drink){
                user.tags["drink"]="true";
            }
            else{
                user.tags["dink"]="false";
            }
            user.tags["heart"]=heartFlag;
            user.tags["diabetes"]=diabetesFlag;
            
            var query = {'_id':user._id};
                                    Users.findOneAndUpdate(query, user, {upsert:true}, function(err, doc){
                                        if (err){ 
                                             console.log("Could not update user", user._id);
                                        }
                                        else{
                                            //work
                                        console.log("updated DB");
                                            var queryString={};
                                            var now = new Date(); 
                                            queryString["form_data[0][email_id]"]=user.email;
                                            queryString["form_data[0][full_name]"]=user.firstName+" "+user.lastName;
                                            queryString["form_data[0][contact_no]"]=user.phone;
                                            queryString["form_data[0][country]"]=user.country;
                                            queryString["form_data[0][ip]"]="na";
                                            queryString["form_data[0][campaign_id]"]="162";
                                            queryString["form_data[0][source]"]="fb-chatbot";
                                            queryString["form_data[0][step_2]"]="no";
                                            queryString["form_data[0][step_2_created_at]"]=user.email;
                                            queryString["form_data[0][step_2_inform_at]"]="2017-01-01 01:01:01";
                                            queryString["form_data[0][chat_id]"]=date.format(now, 'yyyy-MM-dd HH:mm:ss');
                                            var keys = Object.keys(user.triggers);
                                            for(var j=0;j<keys.length;j++){
                                                queryString["form_data[0] [chat_"+keys[j]+"]"]=user.triggers[keys[j]];
                                            }
                                           
                                      request({
                                              url:'http://188.166.253.79/save_enquiry',
                                              qs: queryString
                                             }, 
                                             function(err,response,body){ 
                                                    if (err) {
                                                        console.log("Could not update @ LMS")

                                                    } else {
                                                        console.log(JSON.stringify(response));
                                                        console.log("updated LMS");
                                                    }
                                      }); 
                                     
                                     
                                        }
                                    });
        
                    
            break;
        default:
            break;
    }
    
}



module.exports.validatedText=function(type,text){
     var validatedText=null;
    var pattern;
                switch(type){
                    
                    case "country-number":
                                console.log(type+"^^^^^^^^^^^^^");
                                  pattern = text.match("\[0-9]");
                                   if(pattern&&pattern!=null){
                                       validatedText=null;
                                   } 
                                   validatedText=text.substring(0, 1).toUpperCase()+text.substring(1).toLowerCase();
                       
                        break;
                        
                    case "name-number":
                                console.log(type+"^^^^^^^^^^^^^");
                                  pattern = text.match("\[0-9]");
                                   if(!pattern||pattern==null){
                                       
                                    text=text.trim();
                                    if(text.includes(" ")){
                                         
                                         if(text.split(" ")[text.split(" ").length-1].length==1&&text.split(" ").length>1){
                                             text=text.split(" ")[text.split(" ").length-2];
                                             validatedText=text.substring(0, 1).toUpperCase()+text.substring(1).toLowerCase();
                                         }
                                         else{
                                             text=text.split(" ")[text.split(" ").length-1];
                                             validatedText=text.substring(0, 1).toUpperCase()+text.substring(1).toLowerCase();
                                         }

                                      }
                                    else{
                                        validatedText=text.substring(0, 1).toUpperCase()+text.substring(1).toLowerCase();
                                    }
                                }
                        break;
                        
                    case "age-charactersOnly":
                              validatedText=validateNumber(text);  
                        break;
                    case "age-tooYoung":
                                   console.log(type+"^^^^^^^^^^^^^");
                                    validatedText=validateNumberLessThan(text,1);  
                        break;
                    case "age-tooOld":
                                console.log(type+"^^^^^^^^^^^^^");
                              
                                    validatedText=validateNumberMoreThan(text,100);  
                        break;
                    case "age-multipleNumbers":
                                console.log(type+"^^^^^^^^^^^^^");
                            
                              validatedText=validateNumber(text); 
                        break;
                        
                    case "height-huge":
                                console.log(type+"^^^^^^^^^^^^^");
                             validatedText=validateNumberMoreThan(text,8);  
                        break;
                    case "height-charactersOnly":
                             
                                  console.log(type+"^^^^^^^^^^^^^");
                               
                              validatedText=validateNumber(text);
                        break;
                    case "height-less":
                                console.log(type+"^^^^^^^^^^^^^");
                          validatedText=validateNumberLessThan(text,2);
                        break;
                    case "height-multipleNumbers":
                                 console.log(type+"^^^^^^^^^^^^^");
                                
                                        if (!isNaN(text) && text.toString().indexOf('.') != -1)
                                        {
                                            
                                            var postDecimal=text.split(".")[1];
                                            
                                    console.log("is number"+postDecimal);
                                            if(postDecimal<=12){
                                                validatedText=text;
                                            }
                                        }
                                    
                                
                        break;
                    
                    case "weight-huge":
                               console.log(type+"^^^^^^^^^^^^^");
                              validatedText=validateNumberMoreThan(text,650);
                        break;
                    case "weight-charactersOnly":
                        console.log(type+"^^^^^^^^^^^^^");
                       validatedText=validateNumber(text);
                        break;
                    case "weight-less":
                                console.log(type+"^^^^^^^^^^^^^");
                           validatedText=validateNumberLessThan(text,10);
                        break;
                    case "weight-multipleNumbers":
                                console.log(type+"^^^^^^^^^^^^^");
                          validatedText=validateNumber(text); 
                        break;
                    
                    case "waistSize-huge":
                              console.log(type+"^^^^^^^^^^^^^");
                              validatedText=validateNumberMoreThan(text,100);
                        break;
                    case "waistSize-charactersOnly":
                                console.log(type+"^^^^^^^^^^^^^");
                       validatedText=validateNumber(text);
                        break;
                    case "waistSize-less":
                               console.log(type+"^^^^^^^^^^^^^");
                          validatedText=validateNumberLessThan(text,10);
                        break;
                    case "waistSize-multipleNumbers":
                                console.log(type+"^^^^^^^^^^^^^");
                           validatedText=validateNumber(text); 
                        break;
                        
                    case "email-invalid":
                                console.log(type+"^^^^^^^^^^^^^");
                                console.log(emailValidator.validate(text));
                                if(emailValidator.validate(text)){
                                    validatedText= text;
                                }
                                else{
                                     validatedText=null;
                                }
                        break;
                    case "phone-invalid":
                                console.log(type+"^^^^^^^^^^^^^");
                                pattern = text.match("\[0-9]\[0-9]\[0-9]\[0-9]\[0-9]\[0-9]");
                                   var count=0;
                                    if(pattern&&pattern!=null){
                                     validatedText= text;
                                  }
                        break;
                    
                }
            return validatedText;
}


function validateNumber(text){
    var pattern = text.match("\[a-z]+");
    var validatedText=null;
    if(!isNaN(text)&&(!pattern||pattern==null)){
            validatedText= text;
    }
    return validatedText;
}

function validateNumberMoreThan(text,value){
   var validatedText =null;
            var pattern = text.match("\[0-9]+");
            if(pattern&&pattern!=null){
               if(parseInt(text)<=value){
                 validatedText= text;
              }
            }
    return validatedText;
}

function validateNumberLessThan(text,value){
     var validatedText =null;
    if(text.includes("-")){
            validatedText=null;
        }else{
            var pattern = text.match("\[0-9]+");
            if(pattern&&pattern!=null){
               if(parseInt(text)>=value){
                 validatedText= text;
              }
            }
    }
    return validatedText;
}

function validateNoNumber(){
    var validatedText=null;
    if(isNaN(text)){
            validatedText= text;
    }
    return validatedText;
}


