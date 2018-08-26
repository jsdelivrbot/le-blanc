$(document).ready(function(){
  //$('.deleteUser').on('click',deleteUser);
  $('#deleteUser').on('click',deleteUser);
  $('#deleteDraw').on('click',deleteDraw);
});

function deleteUser(){
  var confirmation = confirm('Are you Sure?');

if(confirmation){
  $.ajax({
    type:'DELETE',
    url:'/users/delete/'+$(this).data('id')
  }).done(function(response){
    window.location.replace('/users');
  })
  ;
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
  })
  ;
  window.location.replace('/draws/');
} else {
  return false;
}
}
