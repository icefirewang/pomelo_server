var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);
var redis = require('redis'),
client = redis.createClient(6379,'127.0.0.1');

var msgHandler = require('./messageHandler');
var sessionHandler = require('./sessionUtil');


exports.setRelation = function(session,msg,next){
	var uid = session.get('uid');
	var tuid =  msg.to;
	var relation = msg.relation;

	var sql =  'select count(*) as count form relation where belong = ? AND to = ?';
	var args = [uid,tuid];
	pomelo.app.get('dbclient').query(sql,args,function(err,res){
		var ret = null;
		if (err) {
			logger.error('getCount :'+err.message);
			ret = {status : 1002};
		}else{
			console.log('get success');
			if (res && res.length === 1) {
				var result  = res[0];
				var count  = result.count;
				var sql;
				var args;
				if (count > 0) {
					 sql  = 'update relation set relation = ? where belong = ? AND to = ?';
					 args = [relation,uid,to];
				}else{
					 sql  = 'insert into relation (belong,to,relation) values (?,?,?)';
					 args = [uid,to,relation];
				}
				
				pomelo.app.get('dbclient').update(sql,args,function(err,res){
					if (err) {
						logger.error('getCount :'+err.message);
						ret = {status :1002};
					}else{
						ret = {status: 0};
					}
					next(null,ret);
				});
			}else{
				ret = {
					status :1003
				};
				next(null,ret);
			}
		}
	
	});
};

exports.setBlack = function(session,msg,next){
	var uid = session.get('uid');
	var tuid = msg.to;
	var isBlack = msg.isBlack;
	var sql  = 'select count(*) as count from relation where belong = ? AND to = ?';
	var args = [uid,tuid];
	logger.error('logger test');
	pomelo.app.get('dbclient').query(sql.args,function(err,res){
		var ret = null;
		if (err) {
			logger.error('query error '+ sql+' ' + JSON.stringify(args));
			ret = {status : 1002};
		}else{
			if (res && res.length === 1) {
				var result  = res[0];
				var count  = result.count;
				var sql;
				var args;
				if (count > 0) {
					 sql  = 'update relation set is_black = ? where belong = ? AND to = ?';
					 args = [isBlack,uid,to];
				}else{
					 sql  = 'insert into relation (belong,to,is_black) values (?,?,?)';
					 args = [uid,to,isBlack];
				}
				
				pomelo.app.get('dbclient').update(sql,args,function(err,res){
					if (err) {
						logger.error('query error '+ sql+' ' + JSON.stringify(args));
						ret = {status :1002};
					}else{
						ret = {status: 0};
						if(isBlack){
							addBlacklistMessage(tuid,uid);
						}else{
							removeBlackMessage(tuid,uid);
						}
					}
					next(null,ret);
				});
			}else{
				ret = {
					status :1003
				};
				next(null,ret);
			}
		}
	
	});
};




function addBlacklistMessage(to_uid,from_uid){
	var message = {
		'from_uid' : from_uid,
		'to_uid' : to_uid,
		'content' : 'add_blacklist'
	};

	var session = sessionHandler.getSessionByUID(to_uid);
	if (session != null) {
		var uid = session.get('uid');
		var sid = session.frontendId;
		msgHandler.sendRelationMessage(uid,sid,message);
	}


}


function removeBlackMessage(to_uid,from_uid){

	var message = {
		'from_uid' : from_uid,
		'to_uid' : to_uid,
		'content' : 'add_whitelist'
	};

	var session = sessionHandler.getSessionByUID(to_uid);
	if (session != null) {
		var uid = session.get('uid');
		var sid = session.frontendId;
		msgHandler.sendRelationMessage(uid,sid,message);
	}

}









