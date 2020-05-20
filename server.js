const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const mongo = require('mongodb');
const jwt = require('jsonwebtoken')
const secret = 'iConnecteQconnect'
const cors = require("cors");

//app.use(cors)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
var mongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/loginApp";

mongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});

app.post('/register',function(req,res){
	let userData = req.body
	mongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("loginApp");
	  //var myobj = { username: userData.username, password: userData.password };
	  dbo.collection("users").insertOne(userData, function(err, result) {
		if (err) throw err;
		res.send("Registerred success");
		db.close();
	  });
	});	
});

app.post('/login',function(req,res){
	let userData = req.body
	console.log(req.body)
	mongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("loginApp");
	  var query = { username: userData.username, password: userData.password };
	  dbo.collection("users").find(query).toArray(function(err, result) {
		if (err) throw err;
		console.log(result.length,result[0]._id);
		
		if(result.length > 0){
			let token = jwt.sign(userData, secret, {
			  expiresIn: 15 * 60 // expires in 15 min
			});
			let newQuery = { username: userData.username, password: userData.password , _id:result[0]._id}
			var updateData = { $set: { username: userData.username, password: userData.password, token:token} };
			  dbo.collection("users").updateOne(newQuery, updateData, function(err, res) {
				if (err) throw err;
			  });
			res.status(200).send({ auth: true, token: token });
		}
		else{
			res.status(404).send({ status: false, message: "No user found" });
		}
		db.close();
	  });
	});	
});
app.listen(8000,function(){
	console.log("App lstening on Port 8000");
});
