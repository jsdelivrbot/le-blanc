$(document).ready(function(){
  //$('.deleteUser').on('click',deleteUser);
  $('.deleteUser').on('click',deleteUser);
  $('.deleteDraw').on('click',deleteDraw);
  $('.selectUser').on('click',selectUser);
  $('.deleteMember').on('click',deleteMember);
  $('.rollDraw').on('click',rollDraw);
  $('.submitUser').on('click',registerUser);

  $('#registerForm').submit(function(event) {
    event.preventDefault();


      // Stop the browser from submitting the form.
      //alert("Preventing stuff");

  });


  // Set up an event listener for the contact form.

});

function registerUser(){
    var myform = document.getElementById("registerForm");
    console.log(myform);
    //var fd = myform.serialize();
    //var fd = new FormData(myform);
    console.log('Trying to register...');

    var fd = {
            'first_name'              : $('input[name=first_name]').val(),
            'email'             : $('input[name=email]').val()
        };

    $.ajax({
      type:'POST',
      url:'/users/add/',
      data:fd
    })

    .done(function(response){
      var greetName = $('input[name=first_name]').val();
      console.log(response);
      window.location.replace('/success/user/'+ greetName);
    })

    .fail(function(response){
      console.log(response);
      alert('Problem registering user!');
      //window.location.replace('/draws/');
    });
}

function deleteUser(){
  var confirmation = confirm('Are you Sure?');

  if(confirmation){
    $.ajax({
      type:'DELETE',
      url:'/users/delete/'+$(this).data('id')
    }).done(function(response){
      window.location.replace('/users');
    });
    window.location.replace('/users');
  } else {
    return false;
  }
}

function deleteDraw(){
  var confirmation = confirm('Are you Sure?');

  if(confirmation){
    $.ajax({
      type:'DELETE',
      url:'/draws/delete/'+$(this).data('id')
    }).done(function(response){
      window.location.replace('/draws/');
    });
    window.location.replace('/draws/');
  } else {
    return false;
  }
}

function deleteMember(){
  var confirmation = confirm('Are you Sure?');
  var drawId = $(this).data('draw');
  var userId = $(this).data('user');

  if(confirmation){
    $.ajax({
      type:'DELETE',
      url:'/member/delete/'+drawId,
      data:{'user':userId}
    }).done(function(response){
      window.location.replace('/draw/members/'+drawId);
    });
  } else {
    return false;
  }
}

function selectUser(){

  var drawId = $(this).data('draw');
  var userId = $(this).data('user');
    $.ajax({
      type:'POST',
      url:'/member/add/'+ drawId,
      data:{'user':userId}
    }).done(function(response){
      window.location.replace('/draw/members/'+drawId);
    });
}

function rollDraw(){
  var drawId = $(this).data('id');

    $.ajax({
      type:'POST',
      url:'/draw/roll/'+drawId
    }).done(function(response){
      window.location.replace('/draw/matches/'+drawId);
    });

}
