

var code = require('../../common/code');

module.exports = function(app) {
	return new ChatRemote(app);
};

var ChatRemote = function(app) {
	this.app = app;
	this.channelService  = app.get('channelService');

};

/**
 *	Add player into channel
 */
ChatRemote.prototype.add = function(uid, sid, channelName, cb) {
	console.log('ChatRemote add');
	var channel = this.channelService.getChannel(channelName,true);
	var ret = code.ok;
	if (!!channel) {
		channel.add(uid,sid);
	}else{
		ret = code.chat.fail_to_get_channel;
	}
	//console.log('add ret '+status);
	cb(null, ret);
};

/**
 * leave Channel
 * uid
 * channelName
 */
ChatRemote.prototype.getCount = function(channelName,cb){
	var channel = this.channelService.getChannel(channelName,false);
	var ret = 0;
	if(channel == null){
	
	}else{
		var users = channel.getMembers();
		ret = users.length;
	}
	cb(ret);
}
/**
 * kick out user
 *
 */
ChatRemote.prototype.kick = function(uid, cb){
	this.chatService.kick(uid);
	cb();
};

ChatRemote.prototype.test = function(uid,cb){
	console.log(this.app);
	console.log('test');
};
