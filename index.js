// ========================================== Setup =====================================================
// run vars
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var {check,validationResult} = require('express-validator/check');

// Mongo userDb
var mongojs = require('mongojs');
var connectionString = 'mongouserDb://heroku_admin:Password1@ds125362.mlab.com:25362/heroku_ntdmwp6n'; // TODO Make this an env config item
var userDb = mongojs(connectionString, ['users']);//mongojs(ConnectionString, [Collections]);
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
      title: 'Secret Santa',
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
      modalText:'Successfully registered, now you can login!'
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
        title: 'Secret Santa',
        users:docs,
        modal:true,
        modalText:'Successfully deleted!'
      });
    })
  });
});

// FINAL
app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});
