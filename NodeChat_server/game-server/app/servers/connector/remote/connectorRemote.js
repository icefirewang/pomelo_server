


module.exoprts = function(app){
	return new ConnectorRemote(app);
};


var ConnectorRemote = function (app) {
	this.app = app;

};


ConnectorRemote.prototype.isUserOnline = function(uid,cb){
	var sessionService = this.app.get('sessionService');
	var sessions = sessionService.getByUid(uid);
	if (sessions || sessions.length == 0 ) {
		cb(null);
	}else{
		cb(sessions[0]);
	}
};