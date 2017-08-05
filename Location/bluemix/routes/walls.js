var express = require( 'express' );
var fs = require( 'fs' );
var getPixels = require( 'get-pixels' );
var multer = require( 'multer' );
var randomstring = require( 'randomstring' );
var request = require( 'request' );

// Router
var router = express.Router();

// Upload storage options
// Unique name with extension
var storage = multer.diskStorage( {
  destination: 'public/uploads',
    filename: function( req, file, cb ) {
      cb( null, randomstring.generate() + '.png' );
    }
} );

// Upload handler
var upload = multer( {
    storage: storage
} );

// Upload map file
router.post( '/walls/upload', upload.single( 'image' ), function( req, res ) {
  getPixels( __dirname + '/../' + req.file.path, function( err, pixels ) {
    console.log( pixels.shape.slice() )
    res.send( req.file.filename );    
  } );
} );

// Clear map files on disk
router.get( '/walls/clean', function( req, res ) {
  var files = null;
  var path = null;
    
  // Get list of files
  files = fs.readdirSync( __dirname + '/../public/uploads' );

  // Iterate
  for( var f = 0; f < files.length; f++ ) {
      // Isolate path
      path = __dirname + '/../public/uploads/' + files[f];

      // Check for file (not directory)
      // Delete file
      if( fs.statSync( path ).isFile() ) {
        fs.unlinkSync( path );            
      }
    }
    
    // Done
    res.send( 'OK' );
} );

// Export
module.exports = router;
