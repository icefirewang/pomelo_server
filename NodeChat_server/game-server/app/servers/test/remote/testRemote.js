module.exports = function(app) {
	return new TestRemote(app);
};

var TestRemote = function(app) {
	this.app = app;
};

TestRemote.prototype.test = function(uid,cb){
	console.log(this.app);
	console.log('test');
};
