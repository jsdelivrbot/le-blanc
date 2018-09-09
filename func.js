var shuffle = require('shuffle-array');


var methods = {


  roll : function(draw){
    //console.log(shuffle);
    var oldMatches = draw.matches;
    var members = draw.members;
    var members2 = draw.members;
    var newMatches = [];
    shuffle(members);
    //shuffle(members2);

    var result = {
      success : true,
      matches : newMatches
    }

    members.forEach(function(member, i){
      var pick = shuffle.pick(members);
      //console.log(i + ':' +member.userName);
      if(member.userId == pick.userId){
        // TODO break loop and re-roll
          //console.log('same name, need to re-roll');
          result.success = false;
      }
      if(checkMatchExists(member,pick,oldMatches)){
        // TODO break loop and re-roll
          //console.log('match found, re-roll');
          result.success = false;
      }
      else {
        var newMatch = {
          fromId : member.userId,
          fromName : member.userName,
          toId:pick.userId,
          toName:pick.userName
        }
        //console.log(newMatch);
        newMatches.push(newMatch);
        result.matches = newMatches;
        //console.log(newMatches);
      }

    })
    return result;
  }
};

function	checkMatchExists(from, to, oldMatches) {
    var exists = false;

    if (oldMatches == null || oldMatches.length == 0 || oldMatches[0] == null)
    {
      return false;
    }

		oldMatches.forEach(function(match, i){
      //console.log('New: '+from.userName+'->'+to.userName +' Old: '+match.fromName+'->'+match.toName);
      //console.log('match.fromId: '+match.fromId);
      //console.log('from.userId: '+from.userId);
      //console.log('match.toId: '+match.toId);
      //console.log('to.userId: '+to.userId);
      if (match.fromId.equals(from.userId) && match.toId.equals(to.userId))
      {
          exists = true;
      }

    })
    //console.log('Exists: ' + exists);
    return exists;
	};

module.exports = methods;
