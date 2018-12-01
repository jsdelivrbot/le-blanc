//console.log(process.env);
// ========================================== Setup =====================================================
// run vars
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var func = require('./func.js');

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
  var inputEmail = req.body.email;
  var inputFirstName = req.body.first_name;
  const errors = validationResult(req);
  if (!errors.isEmpty()){
    console.log(req.body);
    return res.status(422).json({errors:errors.array()});
  }

  userDb.users.findOne({
    email: inputEmail},
  function(err,doc){
    if (doc)
    {
      console.log("User already registered!");
      res.send("User already regitered!");
    }
    else
    {
      var newUser = {
        first_name : inputFirstName,
        email : inputEmail,
        approved: false
      }
      userDb.users.insert(newUser, function(err,result){
        if (err){
          console.log(err);
        }
        //console.log(result);
        console.log('Attempting to send registration via email...');
        var emailSubject = 'Secret Santa - Registration';
        var emailBody = 'Dear '+newUser.first_name+' <br> Thank you for registering! <br>We will take it from here.<br> Yours sincerely,<br>Secret Santa';
        var emailHTMLBody = 'Dear '+newUser.first_name+' Thank you for registering! We will take it from here. Yours sincerely, Secret Santa';
        func.sendMail(newUser.email, emailSubject, emailBody, emailHTMLBody);
        res.send(result);
      });
    }
  })


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
  var thisDraw = null;
  var thisMatches = [];
  drawDb.draws.findOne({_id: ObjectId(req.params.id)}, function(err,doc){
    if(err){
      console.log(err);
    }
    else {
      thisDraw = doc;

      thisMatches = doc.matches;

      if (thisMatches==null || thisMatches.length == 0 || thisMatches[0] == null)
      {
        thisMatches=[];
      }
      //res.send(currentDraw);
      res.render('matches',{
        title: 'Matches for : ' + thisDraw.name,
        draw:thisDraw,
        matches:thisMatches,
        modal:false
      });
  }
});
});

// DRAWS/MEMBERS | GET
// MEMBER|GET
app.get('/draw/members/:id', function(req, res) {
  var currentDraw = null;
  drawDb.draws.findOne({_id: ObjectId(req.params.id)}, function(err,doc){
    var drawId = ObjectId(req.params.id);
    if(err){
      console.log(err);
    }
    else {
      currentDraw = doc;
      //res.send(currentDraw);

      if (currentDraw.hasOwnProperty('members'))
      {
        res.render('members',{
          title: 'Members for : ' + currentDraw.name,
          draw:currentDraw,
          members:currentDraw.members,
          modal:false
        });
      }
      else {
        var emptyMembers = [];
        res.render('members',{
          title: 'Members for : ' + currentDraw.name,
          draw:currentDraw,
          members:emptyMembers,
          modal:false
        });
      }
    }
  });
});

// MEMBER NEW|GET
app.get('/members/new/:id', function(req, res) {

  drawDb.draws.findOne({_id: ObjectId(req.params.id)}, function(err,doc){

    if (err)
    {
      console.log(err);
    }

    else{

      var draw = doc;
      //console.log(doc);
      var newMember = {};

      userDb.users.find(function(err,docs){
      var users = docs;
        var members = [];
      if(draw.members)
      {
        members = draw.members;
      }

      members.forEach(function(member, i){

        docs.forEach(function(user, c){


          if (user._id.equals(member.userId))
          {
            users.splice(c,1);
          }

        })
    })

        res.render('member',{
          title: 'Select User',
          draw:draw,
          users:docs,
          operation:'add',
          modal:false
        });
      });
    }
});
});

app.post('/member/add/:id', function(req, res){

  var thisDraw = null;
  var thisUser = null;
  drawDb.draws.findOne({_id : ObjectId(req.params.id)}, function(err,draw){
    if (err)
    {
      console.log(err);
    }
    else {
      thisDraw = draw;
      userDb.users.findOne({_id : ObjectId(req.body.user)}, function(err2,user){
        if (err2)
        {
          console.log(err2);
        }
        else
        {
          thisUser = user;
          var newMember = {
            userId : thisUser._id,
            userName : thisUser.first_name,
            userEmail : thisUser.email
          };
          drawDb.draws.update(
            {_id : thisDraw._id},
            {$addToSet:{members:newMember}},
            function(err3,result){

              if (err3)
              {
                console.log(err3);
              }
              else {
                res.send('200 OK');
                //console.log(result);
              }
            }
          );
        }
      });
    }
  });
});

app.delete('/member/delete/:id',function(req, res){
    var thisDraw = null;
    var thisUser = null;
    drawDb.draws.findOne({_id : ObjectId(req.params.id)}, function(err,draw){
      if (err)
      {
        console.log(err);
      }
      else {
        thisDraw = draw;
        userDb.users.findOne({_id : ObjectId(req.body.user)}, function(err2,user){
          if (err2)
          {
            console.log(err2);
          }
          else
          {
            thisUser = user;
            var newMember = {
              userId : thisUser._id,
              userName : thisUser.first_name,
              userEmail : thisUser.email
            };
            drawDb.draws.update(
              {_id : thisDraw._id},
              {$pull:{members:newMember}},
              function(err3,result){

                if (err3)
                {
                  console.log(err3);
                }
                else {
                  res.send('200 OK');
                }
              }
            );
          }
        });
      }
    });
  });

  app.post('/draw/roll/:id',function(req, res){
    var thisDraw = null;
    var rollResult = null;
    drawDb.draws.findOne({_id:ObjectId(req.params.id)},function(err,draw){
      thisDraw = draw;
      if(err){
        console.log(err);
      }
      else {

        rollResult = func.roll(thisDraw);
        var reRolls = 0;
        //console.log('result: ' + rollResult.success);

        while(rollResult.success == false){
          //console.log('re-rolling');
          rollResult = func.roll(thisDraw);
          reRolls++;
          //console.log('re-roll result: ' + rollResult.success);
        }

        console.log('Finally! After '+ reRolls + ' re-rolls');
        drawDb.draws.update(
          {_id:thisDraw._id},
          {$set: {matches:[]}},
          function(err2,result1){
            if (err2)
            {
              console.log(err2);
            }
            else {
              //console.log(result1);
              drawDb.draws.update(
                {_id:thisDraw._id},
                {$set: {matches: rollResult.matches}},
                function(err3,result2){

                  if (err3)
                  {
                    console.log(err3);
                  }
                  else {
                    //console.log(result2);
                    res.send('200 OK');
                  }
                }
              )
            }
          }
        )
      }
    });
  });

app.get('/success/user/:name',function(req,res){
  res.render('index',{
    title: 'Secret Santa',
    modal:true,
    modalText:'Successfully registered ' + req.params.name + ', please check your email for a unique magic link!'
  });

});

app.get('/success/send/',function(req,res){
  res.render('index',{
    title: 'Secret Santa',
    modal:true,
    level:'success',
    modalText:'Email Sent successfully!'
  });

});

app.get('/fail/send/',function(req,res){
  res.render('index',{
    title: 'Secret Santa',
    modal:true,
    level:'danger',
    modalText:'Email had problems sending!'
  });

});

app.post('/draws/send/:id',function(req,res){
  console.log('Attempting to send draw via email...');

  // Get list of MATCHES
  var thisDraw = null;
  var thisMatches = [];
  drawDb.draws.findOne({_id: ObjectId(req.params.id)}, function(err,doc){
    if(err){
      console.log(err);
    }
    else {
      thisDraw = doc;

      thisMatches = doc.matches;

      if (thisMatches==null || thisMatches.length == 0 || thisMatches[0] == null)
      {
        thisMatches=[];
      }

      var emailsOk = true;

      thisMatches.forEach(function(match, c){
        var emailSubject = 'Secret Santa Draw - ' + thisDraw.name;
        var emailBody = 'Dear '+match.fromName+' Your draw is: '+match.toName;
        var emailHTMLBody = 'Dear '+match.fromName+'<br> Your draw is: '+match.toName + '<br> Thanks!';
        func.sendMail(match.fromEmail, emailSubject, emailBody, emailHTMLBody);
      })

      if(emailsOk){
        //console.log('Email OK');
        res.status(200).send();
      }
      else {
        console.log('Email Failed');
        //res.status(200).send();
        res.status(500).send('Error sending email!');
      }

/*      res.render('matches',{
        title: 'Matches for : ' + thisDraw.name,
        draw:thisDraw,
        matches:thisMatches,
        modal:false
      });
*/
  }
});

});

// FINAL
app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {

  console.log("Node app is running at localhost:" + app.get('port'))
});
