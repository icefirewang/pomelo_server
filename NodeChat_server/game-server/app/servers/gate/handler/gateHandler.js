var dispatcher = require('../../../utils/dispatch');
var code = require('../../common/code');

module.exports = function(app){
	return new Handler(app);
};


var Handler = function(app){
	this.app = app;
};


Handler.prototype.queryEntry = function(msg,session,next){
	var userid = msg.userid;
	if (!userid) {
		next(null,{status:code.fail})
		return;
	}

	var connectors = this.app.getServersByType('connector');
	if(!connectors || connectors.length == 0){
		next(null,{status:code.gate.no_server_available});
		return;
	}
	var res = dispatcher.dispatch(userid,connectors);
	next(null, {status: code.OK, host: res.host, port: res.clientPort});
};