var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);


module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};


var handler = Handler.prototype;

handler.changeAvatar = function(msg,session,next){
	var uid = session.get('uid');
	var imageKey = msg.key;

	var sql = 'update users set avatar = ? where id = ?';
	var args = [imageKey,uid];

	pomelo.app.get('dbclient').update(sql,args,function(err,res){
		var status = 0;
		if(err){
			logger.error('changeAvatar:'+err.message);
			status = 1002;
		}else{
			if (res.changedRows == 1) {
				status = 0;
				bindNewAvatar(session,imageKey);
			}else{
				status = 1003;
			}
		}

		var ret = {'status' : status};
		if (next) {
			next(null,ret);
		}
	});
}


function bindNewAvatar(session,avatar){
	session.set('avatar',avatar);
	session.pushAll(function(err) {
		if(err) {
			console.error('set rid for session service failed! error is : %j', err.stack);
		}
	});
}