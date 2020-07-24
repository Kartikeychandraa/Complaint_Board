var express = require("express");
var nodemailer = require('nodemailer');
var mail = express.Router();
require('dotenv').config();
mail.use(express.static("public"));


mail.get("/contact",(req,res)=>{
	res.render("contact");	
});


mail.post("/contact",(req,res)=>{
	var name = req.body.name;
	var email = req.body.email;
	var message = req.body.message;

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.email,
    pass: process.env.password,
  }
});

var mailOptions = {
  from: process.env.email,
  to: process.env.email,
  subject: 'Feedback from Mr/Mrs ' + name,
  text: "client-email "+ email +"client-message  " +message,
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
}); 
});


module.exports=mail;