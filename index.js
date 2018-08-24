var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var {check,validationResult} = require('express-validator/check');

// Mongo DB
var mongojs = require('mongojs');
var connectionString = 'mongodb://heroku_admin:Password1@ds125362.mlab.com:25362/heroku_ntdmwp6n';
//var connectionString = 'mongodb://ds125362.mlab.com:25362/heroku_ntdmwp6n';
var db = mongojs(connectionString, ['users']);//mongojs(ConnectionString, [Collections]);
var ObjectId = mongojs.ObjectId;

var app = express();

// View engines
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

// Body Parse middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// Set static path for public
app.use(express.static(__dirname + '/public'));

// Main GET
app.get('/', function(req, res) {
  res.render('index',{
    title: 'Secret Santa',
    modal:false
  });
});

// Register GET
app.get('/register', function(req, res) {
  res.render('register',{
    title: 'Register'
  });
});

// Main GET
app.get('/users', function(req, res) {

  db.users.find(function(err,docs){
    res.render('users',{
      title: 'Secret Santa',
      users:docs,
      modal:false
    });
  })


});

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
    email : req.body.email
  }
  db.users.insert(newUser, function(err,result){
    if (err){
      console.log(err);
    }
    res.render('index',{
      title: 'Secret Santa',
      modal:true,
      modalText:'Successfully registered, now you can login!'
    });
  });
  //console.log(newUser);

});

app.delete('/users/delete/:id',function(req,res){
  db.users.remove({_id: ObjectId(req.params.id)}, function(err,result){
    if(err){
      console.log(err);
    }
    db.users.find(function(err,docs){
      res.render('users',{
        title: 'Secret Santa',
        users:docs,
        modal:true,
        modalText:'Successfully deleted!'
      });
    })
  });
});

// Finally listen on available port
app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});
