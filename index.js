
//0 pending
//1- active
//2 - resolved
//check authenticate function :- non authenticated user na jaaye indemain main 
//check notauthenticate function - authenticated user wapas login register pe naa jayee 

var express = require("express");
var body = require("body-parser");
var ejs = require("ejs");
var mongoose = require("mongoose");
const passport = require('passport');
const bcrypt = require('bcrypt');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const methodoverride=require("method-override");

require('dotenv').config();

const UserModel = require("./model/user");
const ComplaintModel = require("./model/complaint");
mongoose.connect(
  process.env.mongodb,
  { useUnifiedTopology: true, useNewUrlParser: true }
);

var app = express();
app.use(express.urlencoded());
app.use(express.json());
app.use(express.static("public"));
var app = express();
app.use(methodoverride("_method"))
app.set("view engine", "ejs");

app.use(body.urlencoded({ extended: false }));
app.use(body.json());

app.use(session({
    secret: 'secret',
    maxAge: 3600000,
    resave: true,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
// -----------------------------------------------------routes-----------------
var mail = require("./mail")
app.use(mail);
var payment = require("./routes/payment")
app.use(payment);
// -----------------------------------------------------------------------------




app.get("/", function(req, res) {
	res.render("index");
});			

//--------------------------------------------------------------------------------------login-----------
app.get("/login",checkNotAuthenticated, function(req, res) {
	res.render("login");
});



//authenticate passport -------------------------------------------------

// ---------------
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/indexmain')
  }
  next()
}
const checkFun = async(email, password, done) =>{
  UserModel.findOne({ "email": email },(err, data) => {
        if (err) throw err;
        if (!data) {
            return done(null, false);
        }
           bcrypt.compare(password, data.password, (err, match) => {
            if (err) {
                return done(null, false);
            }
            if (!match) {
                return done(null, false);
            }
            if (match) {
                return done(null, data);
            }
        });
      
    })

      
   }
    
var localStrategy = require('passport-local').Strategy;
passport.use(new localStrategy({ usernameField: 'email' },checkFun))


passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
    UserModel.findById(id, function (err, user) {
        cb(err, user);
    });
});// end of autentication statregy

app.post('/login',checkNotAuthenticated, (req, res, next) => {
var promise = new Promise((resolve,reject)=>{
  if (req.body.email === 'admin@gmail.com')
    {resolve();}
  else{reject();}
})
 
promise. 
    then( ()=>{ 
       passport.authenticate('local', {
        failureRedirect: '/login',
        successRedirect: '/admin',
    })(req, res, next);
    })
    .catch(()=> { 
         passport.authenticate('local', {
        failureRedirect: '/login',
        successRedirect: '/indexmain',
    })(req, res, next);

    });

   
});


//----------------------------------------------------------------------------------------register---------
app.get("/register",checkNotAuthenticated, function(req, res) {
	res.render("register");
});
app.post("/register",checkNotAuthenticated,async(req,res,next) =>{
UserModel.find({email : req.body.username},(err,data)=>{
  if(err){
    next();
  }
  else if (data){
res.send('already  a user');
  }
});
});
 app.post("/register",checkNotAuthenticated, async (req, res,next) => {
  console.log("posting register");
   var a = req.body.fname +" "+ req.body.lname;
   var c = req.body.username;
  const hashedPassword = await bcrypt.hash(req.body.password, 10)
   const userr = new UserModel({
     name: a,
     email: c,
     password: hashedPassword,
   });
     try {
       await userr.save();
       res.send(userr);
     } catch (err) {
       res.status(500).send(err);
     }
     res.redirect("/")  
 });
//--------------------------------------------------------------------------------logout--------------------
app.delete("/logout",(req,res)=>
{
req.logout();
res.render("index");
});



app.get("/output", async (req, res) => {
  const data = await UserModel.find({});
  try {
    res.send(data);
  } catch (err) {
    res.status(500).send(err);
  }
});
// ---------------------------------------------------------------------indexmain page------
pending = [];
active = [];
resolved = [];
// -------------------------------------------------------pending page----------
app.get("/pending",checkAuthenticated,(req, res,next) => {
   const id = req.user.id;
   console.log(id);
ComplaintModel.find({ userid : id, status : 0},(err,data)=>{
  if (err)
   {console.log('error occured in active');}
 else{
pending = data;
 }
res.render('pending',{pending1 : pending});
})
})

// --------------------------------------------------------active page -----------
app.get("/active",checkAuthenticated,(req, res) => {
    const id = req.user.id;
ComplaintModel.find({ userid : id, status : 1},(err,data)=>{
  if (err)
   {console.log('error occured in active');}
 else{
active = data;
 }
 res.render('active',{active1 : active})
})
  })

// -----------------------------------------------------resolved page -----------

app.get("/resolved",checkAuthenticated,(req, res) => {
  const id = req.user.id;
  ComplaintModel.find({ userid : id, status : 2},(err,data)=>{
  if (err)
   {console.log('error occured in resolved');}
 else{
resolved = data;
 }
})
  res.render('resolved',{resolved1 : resolved});
  console.log(req.user.id);
});
// --------------------------------------------------indexmain-------------------------
app.get("/indexmain",checkAuthenticated,(req,res)=>{
  res.render("indexmain");
});
// ------------------------------------------------------------------------------------indexmainend
app.post("/complaint", async(req,res)=>{
var a = req.body.cdate;
var b = req.body.csubject;
var c = req.body.csummary;
var d = req.body.clocation;
var e = req.body.cemail;
 const comp = new ComplaintModel({
   userid: req.user.id,
    doi: req.body.cdate,
  subject: req.body.csubject,
  summary: req.body.csummary, 
  location: req.body.clocation,
  status: 0,
  });
  try {
    await comp.save();
    res.send(comp);
  } catch (err) {
    res.status(500).send(err);
  }
  
  console.log(a + "  " + b +"  "+c +"  " +d +"  ");
});

app.get("/coutput", async (req, res) => {
  const data = await ComplaintModel.find({});
  try {
    res.send(data);
  } catch (err) {
    res.status(500).send(err);
  }
})



// ---------------------------------------------------------------------------------admin-Side
var a = [];
app.get("/admin",(req,res)=>{
var promise = new Promise (function (resolve, reject) { 
const data =  ComplaintModel.find({},(err,data)=>{
  a = data;

resolve();
if (err)
{reject()}
});
}); 
promise. 
    then( ()=>{ 
      res.render("admin",{data2 : a });
    })
    .catch(function (err) { 
        console.log(err); 
    });   

});
// -----------------------------------------------------------------------------status-active---
app.post("/change_status_active/:id",(req,res)=>{
  var id = req.params.id;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
console.log(id);
ComplaintModel.findByIdAndUpdate({_id : id},{"status" : 1},(err,data)=>{
  if (err){
    res.send(err);
  }
  else{
  res.redirect("/admin");}
});
}
else{
  console.log("id is not valid " + id);
}
})
//-----------------------------------------------------------------------------------status-resolved--
app.post("/change_status_resolved/:id",(req,res)=>{
 var id = req.params.id;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
console.log(id);
ComplaintModel.findByIdAndUpdate({_id : id},{"status" : 2},(err,data)=>{
  if (err){
    res.send(err);
  }
  else{
  res.redirect("/admin");}
});
}
else{
  console.log("id is not valid " + id);
}
})
// -----------------------------------------------------------------------admin delete complaint
app.post("/delete_complaint/:id",(req,res)=>{
  var id = req.params.id;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    ComplaintModel.findByIdAndDelete({_id : id},(err,data)=>{
      if (err)
        {res.send(err);}
      else{
        res.redirect("/admin");
      }
    })

  }
  else{console.log("id is not valid");}
});
// ------------------------------------------------------------donate API-----------
app.get("/donate",(req,res)=>{
  res.render("donate");
})

app.listen(process.env.PORT || 3000);
console.log("SERVER RUNNING");
