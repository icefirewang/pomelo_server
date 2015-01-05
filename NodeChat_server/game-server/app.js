var pomelo = require('pomelo');
var redis = require('redis'),
client = redis.createClient(6379,'127.0.0.1');



client.on('error',function(err){
	console.log('error:'+err);
});

client.on('connect',function(){
	console.log('redis connected !!');
});


/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'NodeChat-Server');

// app configuration

app.configure('production|development', 'connector', function(){
	console.log("******************************");
	  app.set('connectorConfig',
	    {
	      connector : pomelo.connectors.sioconnector,
	      //websocket, htmlfile, xhr-polling, jsonp-polling, flashsocket
	      transports : ['websocket'],
	      heartbeats : true,
	      closeTimeout : 60,
	      heartbeatTimeout : 60,
	      heartbeatInterval : 25
	    });
		app.loadConfig('mysql',app.getBase() + '/../shared/config/mysql.json');

		app.configure('production|development', 'area|auth|connector|master', function() {
			var dbclient = require('./mysql/mysql').init(app);
			app.set('dbclient', dbclient);
		});
});



// start app
app.start();

process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});
