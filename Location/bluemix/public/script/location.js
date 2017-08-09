class Location {

  constructor() {
    this.location = document.querySelector( '.location' );    
    this.label = document.querySelector( 'p' );
    this.map = document.querySelector( '#map' );
    this.start = document.querySelector( 'select:first-of-type' );
    this.end = document.querySelector( 'select:last-of-type' );

    this.doTokenLoad = this.doTokenLoad.bind( this );
    this.doMapLoad = this.doMapLoad.bind( this );    
    this.doMapsLoad = this.doMapsLoad.bind( this );

    this.maps = null;
    this.model = null;
    this.token = null;

    this.socket = io();
    this.socket.on( 'beacon', evt => this.doBeaconMessage( evt ) );

    this.xhr = new XMLHttpRequest();
    this.xhr.addEventListener( 'load', this.doTokenLoad );
    this.xhr.open( 'GET', '/api/tts/token', true );
    this.xhr.send( null );
  }

  populateDestinations( select, beacons ) {
    while( select.children.length > 0 ) {
      select.removeChild( select.children[0] );
    }

    for( let b = 0; b < beacons.length; b++ ) {
      let option = document.createElement( 'option' );
      option.innerHTML = beacons[b].name;
      option.setAttribute( 'data-major', beacons[b].major );
      option.setAttribute( 'data-minor', beacons[b].minor );      
      select.appendChild( option );
    }    
  }

  doBeaconMessage( evt ) {
    // Find which beacon was triggered
    for( let a = 0; a < this.model.map.areas.length; a++ ) {
      if( 
        this.model.map.areas[a].minor == evt.minor &&
        this.model.map.areas[a].major == evt.major
      ) {
        // Where is the map in the viewport
        let bounds = this.map.getBoundingClientRect();

        // Scale of map to matrix
        let ratio = {
          x: this.map.clientWidth / this.model.map.width,
          y: this.map.clientHeight / this.model.map.height
        };
      
        // Relative map to matrix
        // Accounting for viewport
        let scaled = {
          x: ratio.x * this.model.map.areas[a].x + ( ( ratio.x * this.model.map.areas[a].width ) / 2 ),
          y: ratio.y * this.model.map.areas[a].y + ( ( ratio.y * this.model.map.areas[a].height ) / 2 )          
        };

        // Place location icon
        this.location.style.left = ( scaled.x + bounds.left ) + 'px';
        this.location.style.top = ( scaled.y + bounds.top ) + 'px';        
        this.location.style.display = 'block';
     
        // Say where we are
        WatsonSpeech.TextToSpeech.synthesize( {
          text: 'Kevin, you are in ' + ' ' + this.model.map.context + ' ' + evt.name.toLowerCase() + '.',
          token: this.token
        } );        

        break;
      }
    }
  }

  doMapLoad( evt ) {
    this.model = JSON.parse( this.xhr.responseText );
    this.map.style.backgroundImage = 'url( /maps/' + this.model.map.vector + ' )';

    this.xhr.removeEventListener( 'load', this.doMapLoad );

    this.label.innerHTML = this.model.name;
    this.populateDestinations( this.start, this.model.beacons );
    this.populateDestinations( this.end, this.model.beacons );
  }

  doMapsLoad( evt ) {
    this.maps = JSON.parse( this.xhr.responseText );

    this.xhr.removeEventListener( 'load', this.doMapsLoad );

    this.xhr.addEventListener( 'load', this.doMapLoad );
    this.xhr.open( 'GET', '/api/cloudant/' + this.maps[0].id, true );
    this.xhr.send( null );
  }

  doTokenLoad( evt ) {
    this.token = this.xhr.responseText;

    this.xhr.removeEventListener( 'load', this.doTokenLoad );

    this.xhr.addEventListener( 'load', this.doMapsLoad );
    this.xhr.open( 'GET', '/api/cloudant/all', true );
    this.xhr.send( null );
  }

}

let app = new Location();
