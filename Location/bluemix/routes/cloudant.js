var express = require( 'express' );
var request = require( 'request' );

// Router
var router = express.Router();

router.get( '/cloudant/:doc', function( req, res ) {
  var url = config.cloudant.database + '/' + req.params.doc;

  if( req.params.doc == 'all' ) {
    url = config.cloudant.database + '/_design/location/_view/maps';
  }

  // Retrieve document
  request( {
    method: 'GET',
    url: url, 
    auth: {
      username: config.cloudant.key,
      password: config.cloudant.password
    }
  }, function( err, result, body ) {
    if( req.params.doc == 'all' ) {
      var data = JSON.parse( body );
      res.json( data.rows );
    } else {
      res.send( body );
    }
  } );
} );
  
// Export
module.exports = router;
