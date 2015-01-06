var pomelo = require('pomelo');



module.exports = function(app) {
	return new Handler(app);
};


var Handeler = function(app){
	this.app = app;
	this.channelService = app.get('channelService');
};


Handler.prototype.testFunc = function(msg,session,next){

	var fuid = session.get('uid');
	console.log('fuid '+ fuid);

};