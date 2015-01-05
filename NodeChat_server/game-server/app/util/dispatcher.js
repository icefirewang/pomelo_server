module.exports.dispatch = function(key,list) {
	var index = Math.abs(crc.crc32(key))%list.length;
	return list[index];

};


handler.queryEntry = function (msg,session,next) {
	var connectors = this.app.getServerByType('connector');
	var res  = dispatcher.dispatch(uid.connectors);
};