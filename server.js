'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');
var bodyParser = require("body-parser");
var app = express();


var port = process.env.PORT || 3000;


mongoose.connect(process.env.MONGOLAB_URI);
var schema=mongoose.Schema;
var url=new schema({original_url:String,
                    short_url:String});
const urlProto=mongoose.model("urlProto",url);


app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(bodyParser.json());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


app.post("/api/shorturl/new",function(req,res){
  console.log("something happened");
  console.log(req.body);
  urlProto.findOne({ original_url: req.body.url }, 
    async function(err, data) {
      if (data) {
        res.json({data}) 
      } 
      else if(err) {
        res.send("Error, retry")
      } else {
          createShortURL().then(function(text){if(text===false){res.json({"original_url":"No short URLs"})};
            var body= createAndSaveURL(req.body.url,text.toString());
            res.json({body});
          });
      }
    });
});
app.get("/api/shorturl/:short",function(req,res){
var shortenedURL=req.params.short;
  urlProto.find({short_url:shortenedURL},
  async function(err,data){if(data){if(data[0]){res.redirect(data[0].original_url);}}res.send("url doesnt exist")})

})




app.listen(port, function () {
  console.log('Node.js listening ...');
});




function createAndSaveURL(ORIGURL,SHORTURL) {
  if(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(ORIGURL)){
    var urll=new urlProto({original_url: ORIGURL, short_url: SHORTURL});
    urll.save((err,data)=>{if(err){console.log(err)}})
    return urll;
  }
  else {
    return {
      original_url:"invalid url",short_url:"invalid url"
    }
  }
}


async function createShortURL(time=new Date()){
  var arr=null;
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var doit = false;
  for (var i = 0; i < 6; i++)
  {    
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  
  var dif=(new Date().getTime())-(time.getTime());
  if(dif>=5){return false;}
  await urlProto.findOne({short_url: text}).then(
    function(data){
      if(data){
       // console.log("before");
        createShortURL(time);
      } else {
      //  console.log("before");
        doit = true;
      }
  });
  
  //console.log(text);
  if(doit){
    return text;
  }
}

