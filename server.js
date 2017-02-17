//import dependencies
var express = require('express');
var bodyParser = require('body-parser');
var request = require("request");
var morgan = require("morgan");

//web declarations - initializations
var app = express();
var router =express.Router();
var port = process.env.PORT||80;

//web routes
var fbRoutes = require("./app/routes/facebookapi")(router);
var brandRoutes = require("./app/routes/brandapi")(router);
var backendRoutes = require("./app/routes/backendapi")(router);

//db connection
var dbConnection=require("./app/init/dbConnection");

//other init functions
var boot = require("./app/init/boot");

//web setup
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//web routes setup
app.use("/webhook",fbRoutes);
app.use("/brand",brandRoutes);
app.use("/backend",backendRoutes);


//server operations
app.listen(port,function(){
   boot.start();
   console.log("Running server on port "+port); 
});

//get home
app.get('/', function(req, res) {
    res.status(200).send("Mia on steroid!");
});

//databse initialization
dbConnection.init();


