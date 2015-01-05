
var logger  = require('./logMgr');


var error = {
	'er_nothing' 			: 0,
	'er_puchMsg'			: 1001,
	'er_sql_client'			: 1002,
	'er_sql_get'			: 1004,
	'er_session_push'		: 1005,
	'er_redis_off_line_msg'	: 1006
};


exports.code = function(key){

	var ret = error[key];
	if (ret == null) {
		ret = -1;
		logger.setLog('sys','get unknow error code :'+key);
	}
	return ret;
};

