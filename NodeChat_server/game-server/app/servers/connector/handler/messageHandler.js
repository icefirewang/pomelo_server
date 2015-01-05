var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);
var error = require('./errorCode');

var redis = require('redis'),
client = redis.createClient(6379,'127.0.0.1');



exports.getOfflineMessage = function(session,next){
	var uid = session.get('uid');
	var key = 'offmsg_'+ uid;
	var sid = session.frontendId;
	client.lrange(key,0,-1,function(err,reply){
		if (err) {
			console.log(err.toString());
		}else{
			if (reply) {
				if(reply.length > 0)
				sendOfflineMessage(uid,sid,reply,next); 
			}
			
		}
	});
}


function sendOfflineMessage(uid,frontendId,msg,next){
	console.log('send off line message :>>');
	console.log(msg);
	var sid = frontendId;
	var channelService = pomelo.app.get('channelService');
	channelService.pushMessageByUids("OfflineMessage",msg,[{uid:uid,sid:sid}],function(err,fails){
		console.log('push finished');
		var ret = null;
		var errCode = errorCode.code['er_nothing'];
		if(!!err){
			errCode = error.code('er_puchMsg');
			console.log('Push Message error! %j', err.stack);
		}else{
	
		}

		ret = {
			status : errCode,
		};
		if(errCode == 0){
			delOfflineMessage(uid);
		}

		if (next) {
			next(null,ret);
		};
	});
}

function delOfflineMessage(uid){
	var key = 'offmsg_'+uid;
	client.del(key,function(err,reply){
		console.log(reply);
	});
}

exports.sendRelationMessage = function(uid,frontendId,msg){
	var sid = frontendId;
	var channelService = pomelo.app.get('channelService');
	channelService.pushMessageByUids("RelationMessage",msg,[{uid:uid,sid:sid}],function(err,fails){
		console.log('push finished');
		var ret = null;
		var errCode = 0;
		if(!!err){
			errCode = error.code('er_puchMsg');
			logger.error('sendRelationMessage:'+err.message);
		}else{
			
		}
		var timestamp = new Date().getTime();
		ret = {
			status : errCode,
			ts : timestamp
		}

	});
};

exports.sendMessage = function(uid,frontendId,msg,next){
	var sid = frontendId;
	var channelService = pomelo.app.get('channelService');
	channelService.pushMessageByUids("ChatMessage",msg,[{uid:uid,sid:sid}],function(err,fails){
		console.log('push finished');
		var ret = null;
		var errCode = 0;
		if(!!err){
			errCode = error.code('er_puchMsg');
			console.log('Push Message error! %j', err.stack);
		}else{
		
		}
		var timestamp = new Date().getTime();
		ret = {
			status : errCode,
			ts : timestamp
		}

			if (next) {
				next(null,ret);
			};
	});
};
