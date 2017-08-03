var cfenv = require( 'cfenv' );
var express = require( 'express' );
var jsonfile = require( 'jsonfile' );
var mqtt = require( 'mqtt' );
var parser = require( 'body-parser' );
var request = require( 'request' );

// External configuration
config = jsonfile.readFileSync( __dirname + '/config.json' );

// Application
var app = express();

// Middleware
app.use( parser.json() );
app.use( parser.urlencoded( { 
	extended: false 
} ) );

// Per-request actions
app.use( function( req, res, next ) {	
	// Configuration
	req.config = config;
	
	// Just keep swimming
	next();
} );

// Static for main files
app.use( '/', express.static( 'public' ) );

// Routes
app.use( '/api', require( './routes/tts' ) );

// Bluemix
var env = cfenv.getAppEnv();

// Listen
var server = app.listen( env.port, env.bind, function() {
	// Debug
	console.log( 'Started on: ' + env.port );
} );

// Connect to Watson IoT
var client  = mqtt.connect( 
  config.iot.host, 
  {
    clientId: config.iot.client,
    username: config.iot.application,
    password: config.iot.token,
    port: config.iot.port
  }
);

// Socket
var io = require( 'socket.io' )( server );

// Connected to Watson
// Subscribe for sensor data
client.on( 'connect', function() {
  console.log( 'Connected.' );

  client.subscribe( config.iot.topic, function( error, granted ) {
    console.log( 'Beacons.' );
  } );
} );

// New message arrived
client.on( 'message', function( topic, message ) {
  var data = null;
  var destination = null;

  // Parse JSON
  data = JSON.parse( message.toString() );

  if( topic == config.iot.topic ) {
    destination = 'beacon';
  }

  // Send to dashboard
  io.emit( destination, data );
} );
