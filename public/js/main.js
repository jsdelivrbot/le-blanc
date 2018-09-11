$(document).ready(function(){
  //$('.deleteUser').on('click',deleteUser);
  $('.deleteUser').on('click',deleteUser);
  $('.deleteDraw').on('click',deleteDraw);
  $('.selectUser').on('click',selectUser);
  $('.deleteMember').on('click',deleteMember);
  $('.rollDraw').on('click',rollDraw);
});

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
