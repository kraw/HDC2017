class Location {

  constructor() {
    this.location = document.querySelector( '.location' );    
    this.map = document.querySelector( '#map' );
    this.start = document.querySelector( 'select:first-of-type' );
    this.end = document.querySelector( 'select:last-of-type' );

    this.previous = document.querySelector( 'button:first-of-type' );
    this.previous.addEventListener( 'click', evt => this.doPreviousClick( evt ) );

    this.next = document.querySelector( 'button:last-of-type' );
    this.next.addEventListener( 'click', evt => this.doNextClick( evt ) );

    this.doTokenLoad = this.doTokenLoad.bind( this );
    this.doMapLoad = this.doMapLoad.bind( this );    
    this.doMapsLoad = this.doMapsLoad.bind( this );

    this.index = null;
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

  load( id ) {
    this.location.style.display = 'none';

    this.xhr.addEventListener( 'load', this.doMapLoad );
    this.xhr.open( 'GET', '/api/cloudant/' + id, true );
    this.xhr.send( null );
  }

  populate( select, beacons ) {
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
     
        // Set navigation
        for( let s = 0; s < this.start.children.length; s++ ) {
          let major = parseInt( this.start.children[s].getAttribute( 'data-major' ) );
          let minor = parseInt( this.start.children[s].getAttribute( 'data-minor' ) );          

          if( major == evt.major && minor == evt.minor ) {
            this.start.children[s].setAttribute( 'selected', true );
            this.end.children[s].setAttribute( 'selected', true );
          } else {
            this.start.children[s].removeAttribute( 'selected' );
            this.end.children[s].removeAttribute( 'selected' );
          }
        }

        // Say where we are
        WatsonSpeech.TextToSpeech.synthesize( {
          text: 'Kevin, you are in ' + evt.label + '.',
          token: this.token
        } );        

        break;
      }
    }
  }

  doMapLoad( evt ) {
    this.model = JSON.parse( this.xhr.responseText );

    this.previous.style.display = 'block';
    this.map.src = '/maps/' + this.model.map.vector;
    this.next.style.display = 'block';
    this.populate( this.start, this.model.beacons );
    this.populate( this.end, this.model.beacons );

    this.xhr.removeEventListener( 'load', this.doMapLoad );    
  }

  doMapsLoad( evt ) {
    this.maps = JSON.parse( this.xhr.responseText );
    this.index = 0;

    this.xhr.removeEventListener( 'load', this.doMapsLoad );

    this.load( this.maps[this.index].id );
  }

  doNextClick( evt ) {
    if( this.index == ( this.maps.length - 1 ) ) {
      this.index = 0;
    } else {
      this.index = this.index + 1;
    }

    this.load( this.maps[this.index].id );
  }

  doPreviousClick( evt ) {
    if( this.index == 0 ) {
      this.index = this.maps.length - 1;
    } else {
      this.index = this.index - 1;
    }

    this.load( this.maps[this.index].id );
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
