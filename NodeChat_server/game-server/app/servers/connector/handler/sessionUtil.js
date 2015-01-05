var pomelo = require('pomelo');




exports.getSessionByUID = function(uid){
	var sessionService = this.app.get('sessionService');
	var ret  = sessionService.getByUid(tuid);
	return ret[0];
}