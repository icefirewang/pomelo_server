
var logger = require('pomelo-logger').getLogger(__filename);


exports.setLog = function(fileName,funcName,type,msg){

	var string = 'file<'+fileName+'>' +'func<'+funcName+'>'+'type<'+msg+'>';
	console.log(string);
	logger.error(string);
}