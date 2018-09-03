//console.log(process.env);
// ========================================== Setup =====================================================
// run vars
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var {check,validationResult} = require('express-validator/check');

// Mongo userDb
var mongojs = require('mongojs');
var connectionString = process.env.MONGODB_URI; // TODO Make this an env config item

// Users
var userDb = mongojs(connectionString, ['users']);//mongojs(ConnectionString, [Collections]);
// Draws
var drawDb = mongojs(connectionString, ['draws']);

var ObjectId = mongojs.ObjectId;

// general init
var app = express();

// View engines
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

// Body Parse middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// Set static path for public
app.use(express.static(__dirname + '/public'));


// ======================================================================================================
// Main

// HOME|GET
app.get('/', function(req, res) {
  res.render('index',{
    title: 'Secret Santa',
    modal:false
  });
});

// REGISTER|GET
app.get('/register', function(req, res) {
  res.render('register',{
    title: 'Register'
  });
});

// USERS|GET
app.get('/users', function(req, res) {

  userDb.users.find(function(err,docs){
    res.render('users',{
      title: 'Users',
      users:docs,
      modal:false
    });
  })
});

// USERS|ADD
app.post('/users/add', [
  // email must be email
  check('email').not().isEmpty(),
  check('first_name').not().isEmpty(),
  check('email').isEmail()
],(req,res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()){
    return res.status(422).json({errors:errors.array()});
  }
  var newUser = {
    first_name : req.body.first_name,
    email : req.body.email,
    approved: false
  }
  userDb.users.insert(newUser, function(err,result){
    if (err){
      console.log(err);
    }
    res.render('index',{
      title: 'Secret Santa',
      modal:true,
      modalText:'Successfully registered, please check your email for a unique magic link!'
    });
  });
});

// USERS|DELETE
app.delete('/users/delete/:id',function(req,res){
  userDb.users.remove({_id: ObjectId(req.params.id)}, function(err,result){
    if(err){
      console.log(err);
    }
    userDb.users.find(function(err,docs){
      res.render('users',{
        title: 'Users',
        users:docs,
        modal:true,
        modalText:'Successfully deleted!'
      });
    })
  });
});

// DRAWS|GET
app.get('/draws', function(req, res) {

  drawDb.draws.find(function(err,docs){
    res.render('draws',{
      title: 'Draws',
      draws:docs,
      modal:false
    });
  })
});

// DRAWS NEW|GET
app.get('/draws/new', function(req, res) {
  var emptyDraw = {
    _id:null,
    name:''
  };
  res.render('draw',{
    title: 'Draw Details',
    draw:emptyDraw,
    operation:'add',
    modal:false,
  });
});

// DRAWS|ADD
app.post('/draws/add', [
  check('name').not().isEmpty()
],(req,res) => {
  //console.log(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()){
    return res.status(422).json({errors:errors.array()});
  }
  var newDraw = {
    name : req.body.name,
    active: false
  }
  drawDb.draws.insert(newDraw, function(err,result){
    if (err){
      console.log(err);
    }
    res.render('index',{
      title: 'Secret Santa',
      modal:true,
      modalText:'Successfully added'
    });
  });
});

// DRAWS|UPDATE
app.post('/draws/update', [
  check('name').not().isEmpty()
],(req,res) => {
  //console.log(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()){
    return res.status(422).json({errors:errors.array()});
  }

  drawDb.draws.update(
    { _id: ObjectId(req.body.id) },
    {
      $set: { "name":  req.body.name}
    },function(err, result) {
      if (err){
        console.warn(err.message);  // returns error if no matching object found
      }else{
        console.dir(result);
      }
    });

res.redirect('../draws');

});

// DRAWS|DELETE
app.delete('/draws/delete/:id',function(req,res){
  drawDb.draws.remove({_id: ObjectId(req.params.id)}, function(err,result){
    if(err){
      console.log(err);
    }
    drawDb.draws.find(function(err,docs){
      res.render('draws',{
        title: 'Draws',
        draws:docs,
        modal:true,
        modalText:'Successfully deleted!'
      });
    });
  });
});

// DRAWS|EDIT
app.get('/draws/:id',function(req,res){
  drawDb.draws.findOne({_id: ObjectId(req.params.id)}, function(err,doc){
    if(err){
      console.log(err);
    }
    res.render('draw',{
      title: 'Draw Details',
      draw:doc,
      operation:'update',
      modal:false,
    });
  });
});

// DRAWS/MATCHES | GET
// DRAWS|GET
app.get('/draw/matches/:id', function(req, res) {
    res.send('TBD');
});
  // drawDb.draws.find(function(err,docs){
  //   res.render('draws',{
  //     title: 'Draws',
  //     draws:docs,
  //     modal:false
  //   });
  // })




// FINAL
app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {

  console.log("Node app is running at localhost:" + app.get('port'))
});
