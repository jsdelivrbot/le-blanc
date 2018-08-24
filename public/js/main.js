$(document).ready(function(){
  $('.deleteUser').on('click',deleteUser);
  $('#deleteUser').on('click',deleteUser);
  $('#myModal').modal('show');
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
