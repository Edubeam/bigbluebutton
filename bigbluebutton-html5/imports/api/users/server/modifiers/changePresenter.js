import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import stopWatchingExternalVideo from '/imports/api/external-videos/server/methods/stopWatchingExternalVideo';

export default function changePresenter(presenter, userId, meetingId, changedBy) {
  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      presenter,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Changed user role: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Changed presenter=${presenter} id=${userId} meeting=${meetingId}`
      + `${changedBy ? ` changedBy=${changedBy}` : ''}`);
    }

    return null;
  };

  const meeting = Meetings.findOne({ meetingId });
  if (meeting && meeting.externalVideoUrl) {
    Logger.info(`ChangePresenter:There is external video being shared. Stopping it due to presenter change, ${meeting.externalVideoUrl}`);
    stopWatchingExternalVideo({ meetingId, requesterUserId: userId });
  }
  
  // added by prince
   // Users.update({meetingId},{ $set: {presenterIsChanged:1,} },false,true);

  //  Meteor.Users.update({},{ $set: {presenterIsChanged:1,} });
  Users.update({meetingId}, {$unset: {presenterIsChanged: true}}, {multi: true});
  Users.update({meetingId}, {$set: {presenterIsChanged: true}}, {multi: true});
  // users.update({_id : "Jack"},{$set:{age : 13, username : "Jack"}});
  return Users.update(selector, modifier, cb);
 //return Users.update({},{ $set: {"name":"NewChanged",}, },false,true,cb);
}
