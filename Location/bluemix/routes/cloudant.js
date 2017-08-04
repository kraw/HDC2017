var express = require( 'express' );
var request = require( 'request' );

// Router
var router = express.Router();

router.get( '/cloudant/:doc', function( req, res ) {
  var hash = null;
  
  // Retrieve document
  request( {
    method: 'GET',
    url: config.cloudant.database + '/' + req.params.doc, 
    auth: {
      username: config.cloudant.key,
      password: config.cloudant.password
    }
  }, function( err, result, body ) {
    res.send( body );
  } );
} );
  
// Export
module.exports = router;
