
var pomelo = require('pomelo');
var logger = require('./logMgr');
var redis = require('redis'),
client = redis.createClient(6379,'127.0.0.1');

var msgHandler = require('./messageHandler');
var async = require("async");


module.exports = function(app) {
	return new Handler(app);
};


var Handler = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};


var handler = Handler.prototype;

handler.send = function (msg,session,next) {

	console.log('send--------------------------');
	var content = msg.content;
	var tuid = msg.to;

	var sessionService = this.app.get('sessionService');
	var toSessions  = sessionService.getByUid(tuid);

	var toSession = null;
	if (toSessions) {
		toSession = toSessions[0];
	}
	
	var fuid = session.get('uid');
	var nick = session.get('nick');
	var avatar = session.get('avatar');
	var timestamp = new Date().getTime();

	var message = {
		'content' 	: content,
		'nick' 		: nick,
		'avatar'	: avatar,
		'f_id' 		: fuid,
		't_id' 		: tuid,
		'ts'		: timestamp,

	};

	console.log(message);

	if (toSession == null) {
		console.log('user off line');
		this.saveOfflineMessage(message,next);
		return;
	}

	var sid = toSession.frontendId;
	msgHandler.sendMessage(tuid,sid,[message],next);

};


handler.chatToInfo = function(msg,sendMessage,next)
{

}

handler.getUserInfo = function(msg,session,next){
	console.log('get user info ' + msg.uid);
	var userid = msg.uid;
	var sql = 'select * from users where uid = ?';
	var args = [userid];
	pomelo.app.get('dbclient').query(sql,args,function(err,res){
		var ret = null;
		if (err) {
			logger.setLog(__filename,'getUserInfo','db',err.message);
			//logger.error('getUserInfo:'+err.message);
			ret = {status : error.code('er_sql_client')};
		}else{
			console.log('get success');
			if (res && res.length === 1) {
				var result  = res[0];
				var nick  = result.nick;
				var avatar = result.avatar;
				var uid = result.uid;
				var content = {
					'nick' : nick,
					'avatar' :avatar,	
					'uid' : uid	
				};
				ret = {
				'status'  : 0,
				'content' : content
				}
			}else{
				ret = {
					status :1003
				};
			}
		}
		next(null,ret);
	});
};




function getRelation(belong,to,callback){
	var sql = 'select * from relation where belong = ? AND to = ?';
	var arge = [belong,to];
	pomelo.app.get('dbclient').query(sql,args,function(err,res){
		var ret = null;
		if (err) {
			logger.setLog(__filename,'getRelation','db',err.message);
			ret = {status : error.code('er_sql_client')};
		}else{
			if (res.length == 1) {

			}
		}
	});
}

// handler.sendMessage = function(uid,frontendId,msg){
// 	var sid = frontendId;
// 	var channelService = pomelo.app.get('channelService');
// 	channelService.pushMessageByUids("ChatMessage",msg,[{uid:tuid,sid:sid}],function(err,fails){
// 		console.log('push finished');
// 		var ret = null;
// 		if(!!err){
// 			console.log('Push Message error! %j', err.stack);
// 			ret = {status : 1001};
// 		}else{
// 			ret = {status : 0};
// 		}
// 	});
// };

// function sendMessage(uid,frontendId,msg,next){
// 	var sid = frontendId;
// 	var channelService = pomelo.app.get('channelService');
// 	channelService.pushMessageByUids("ChatMessage",message,[{uid:tuid,sid:sid}],function(err,fails){
// 		console.log('push finished');
// 		var ret = null;
// 		if(!!err){
// 			console.log('Push Message error! %j', err.stack);
// 			ret = {status : 1001};
// 		}else{
// 			ret = {status : 0};
// 		}
// 		next(null,ret);
// 	});
// };

// handler.saveOffLineMessage = function(msg,next){
// 	var sql = 'insert into unread_message (fid,tid,timestamp,content) values (?,?,?,?)';
// 	var timestamp = new Date().getTime();
// 	var msgString = JSON.stringify(msg);
// 	var args = [msg.from_id,msg.to_id,timestamp,msgString];
// 	pomelo.app.get('dbclient').insert(sql,args,function(err,res){
// 		var ret = null;
// 		if (err) {
// 			console.log('insert fail :'+err.message);
// 			ret = {status : 1001};
// 		}else{
// 			console.log('insert success');
// 			ret = {status : 0};
// 		}
// 		next(null,ret);
// 	});
// };


handler.saveOfflineMessage = function(msg,next){
	console.log('saveOfflineMessage:>>');
	 var key = 'offmsg_'+ msg.t_id;
//	 console.log('key:'+key);
	 var msgString = JSON.stringify(msg);
	 console.log(msg);
	 // client.append(key,msgString,function(err,reply){
	 // 	console.log(reply.toString());
	 // });
	var multi = client.multi();
	 multi.rpush(key,msgString);
	 multi.exec(function(err,results){
		console.log(results);
		var status = 0;
		if (err) {	
			status = 1005;
		}else{
			
		}
		if (next) {
			var timestamp = new Date().getTime();
			var ret = {
				'status' : status,
				'ts' : timestamp
			}
			next(null,ret);
		}
	 })

};

function errHandler(err, fails){
	if(!!err){
		console.log('Push Message error! %j', err.stack);
	}else{

	}
}




