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
app.use( '/api', require( './routes/cloudant' ) );
app.use( '/api', require( './routes/tts' ) );
app.use( '/api', require( './routes/walls' ) );

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
    clientId: config.iot.client + Math.random().toString( 16 ).substr( 2, 8 ),
    username: config.iot.application,
    password: config.iot.token,
    port: config.iot.port
  }
);

// Socket
var io = require( 'socket.io' )( server );

// New socket connection
io.on( 'connection', function( socket ) {
  // Listen for beacon event
  // Broadcast when encountered
  socket.on( 'beacon', function( data ) {
    request( {
      method: 'POST',
      url: env.url + '/api/cloudant/' + data.document,
      json: data
    } );
    
    io.emit( 'beacon', data );
  } );
} );

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

    request( {
      method: 'POST',
      url: env.url + '/api/cloudant/' + data.document,
      json: data
    } );    
  }

  // Send to dashboard
  io.emit( destination, data );
} );
