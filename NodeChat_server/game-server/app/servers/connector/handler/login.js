
var pomelo = require('pomelo');
var error = require('./errorCode');
var redis = require('redis'),
client = redis.createClient(6379,'127.0.0.1');
var msgHandler = require('./messageHandler');
var chat = require('./chat');

//var logger = require('pomelo-logger').getLogger(__filename);
var logger  = require('./logMgr');

client.on('error',function(err){
	console.log('error:'+err);
});


module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};


var handler = Handler.prototype;



handler.login = function (msg,session,next) {
		console.log("log--------------------------------");
		var user = msg.user;
		var password = msg.password;

		var sql = "select * from users where account = ? AND password = ?";
		var args = [user,password];
		var sessionService = this.app.get('sessionService');
		pomelo.app.get('dbclient').query(sql,args,function(err,res){
			var status = error.code('er_nothing');
			console.log('error code er_nothing %d',status);
			var nick;
			var uid;
			var avatar;
			console.log(res);
			if (err) {
				logger.setLog(__filename,'login','sys',err.message);
				//logger.error('login:'+err.message);
				status = error.code('er_sql');
				next(null,{'status':status});
				return;
			}else if(res && res.length === 1) {
				var result = res[0];
				nick = result.nick;
				uid = result.uid;
				avatar = result.avatar;
			}else{
				status = error.code('er_sql_get');
				next(null,{'status':status});
				return;
			}


			if( !! sessionService.getByUid(uid)) {
				console.log(' same uid');
				next(null, {
					status: 500
				});
				return;
			}
			
			session.bind(uid);
			session.set('uid',uid);
			session.set('nick',nick);
			session.set('avatar',avatar);


			session.pushAll(function(err) {
				if(err) {
					logger.setLog(__filename,'login','sys',err.message);
					//logger.error('set rid for session service failed! error is : %j', err.stack);
					var errorCode = error.code('er_session_push');
					next(null,{status:errorCode});
					return;
				}
			});

			var userInfo = {
				nick:nick,
				uid:uid,
				avatar:avatar
			};
			ret = {
				status : status,
				userInfo : userInfo
			};

			next(null,ret);
		});	
};




handler.getOfflineMessage = function(msg,session,next){
	console.log('getOffLineMessage');

	var uid = session.get('uid');
	var sid = session.frontendId;

	var key = 'offmsg_'+ uid;

	client.lrange(key,0,-1,function(err,reply){
		var status = 0;
		if (err) {
			logger.setLog(__filename,'getOfflineMessage','sys',err.toString());
			//logger.error('getOfflineMessage:'+err.toString());
			status = error.code('er_redis_off_line_msg');
		}else{
			if (reply) {
				status = msgHandler.sendMessage(uid,sid,reply,next); 
				if (ret === 0) {
					console.log('delete off line');
					client.del(key);
				}else{
					//logger.error('send offline message: code '+ret);
					logger.setLog(__filename,'getOfflineMessage','sys',ret);
				}
			}
		}
		next(null,{status:status});
	});

};



handler.getSession = function(msg,session,next) {

	console.log("session "+session);
	console.log("getSession");
	var userid = session.get('uid');
	var name = session.get('nick');
	console.log('userid '+userid);
	console.log('nick '+ name);
	
	var ret = {
		'error':'0',
	};
	
	next(null,ret);
};



