var express = require( 'express' );
var request = require( 'request' );

// Router
var router = express.Router();

// Access token
router.get( '/tts/token', function( req, res ) {
  var hash = null;
  
  // Request token
  request( {
    method: 'GET',
    url: req.config.tts.stream + '?url=' + req.config.tts.url, 
    auth: {
      username: req.config.tts.username,
      password: req.config.tts.password    
    }
  }, function( err, result, body ) {
    res.send( body );
  } );
} );

// Export
module.exports = router;
