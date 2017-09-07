class Location {

  constructor() {
    this.index = null;
    this.maps = null;
    this.model = null;
    this.token = null;

    this.doTokenLoad = this.doTokenLoad.bind( this );
    this.doMapLoad = this.doMapLoad.bind( this );    
    this.doMapsLoad = this.doMapsLoad.bind( this );

    this.svg = document.querySelector( 'svg' );
    this.peak = document.querySelector( '#peak' );
    this.columns = document.querySelector( '#columns' );

    this.location = document.querySelector( '.location' );    

    this.brand = document.querySelector( '#branding' );
    this.brand.addEventListener( 'click', evt => this.doBrandClick( evt ) );

    this.map = document.querySelector( '#map' );
    this.map.addEventListener( 'load', evt => this.doMapImageLoad( evt ) );

    this.navigation = document.querySelector( 'svg' );
    
    this.start = document.querySelector( 'select:first-of-type' );
    this.start.addEventListener( 'change', evt => this.doLocationChange( evt ) );

    this.end = document.querySelector( 'select:last-of-type' );
    this.end.addEventListener( 'change', evt => this.doLocationChange( evt ) );

    this.previous = document.querySelector( 'button:first-of-type' );
    this.previous.addEventListener( 'click', evt => this.doPreviousClick( evt ) );

    this.next = document.querySelector( 'button:last-of-type' );
    this.next.addEventListener( 'click', evt => this.doNextClick( evt ) );

    this.socket = io();
    this.socket.on( 'beacon', evt => this.doBeaconMessage( evt ) );

    this.xhr = new XMLHttpRequest();
    this.xhr.addEventListener( 'load', this.doTokenLoad );
    this.xhr.open( 'GET', '/api/tts/token', true );
    this.xhr.send( null );
  }

  chart() {
    // Clean up previous chart
    while( this.columns.childNodes.length > 0 ) {
      this.columns.removeChild( this.columns.childNodes[0] );
    }

    // Current day usage
    let today = new Date();
    today.setHours( 0 );
    today.setMinutes( 0 );
    today.setSeconds( 0 );
    today.setMilliseconds( 0 );

    // TODO: Magic number much?
    // TODO: svg.clientWidth reporting different number from actual width
    let width = 175 / this.model.beacons.length;
    let max = -1;
    
    for( let b = 0; b < this.model.beacons.length; b++ ) {
      console.log( this.model.beacons[b] );
      // Column label
      let beacon = document.createElementNS( 'http://www.w3.org/2000/svg', 'text' );
      beacon.setAttributeNS( null, 'x', ( b * width ) + ( width / 2 ) );
      beacon.setAttributeNS( null, 'y', 70 );
      beacon.setAttributeNS( null, 'fill', 'rgba( 255, 255, 255, 0.50 )' );
      beacon.setAttributeNS( null, 'font-size', '10px' );
      beacon.setAttributeNS( null, 'font-weight', '100' );
      beacon.setAttributeNS( null, 'font-family', 'Roboto' );
      beacon.setAttributeNS( null, 'text-anchor', 'middle' );
      beacon.textContent = this.model.beacons[b].minor;
      this.columns.appendChild( beacon );

      // Number of visits
      let count = 0;
      
      // Look through history
      for( let h = 0; h < this.model.history.length; h++ ) {
        // Increment matches
        if( 
          this.model.beacons[b].major == this.model.history[h].major &&
          this.model.beacons[b].minor == this.model.history[h].minor &&
          this.model.history[h].visitedAt > today.getTime()
        ) {
          count = count + 1;
        }
      }

      // Also track largest
      if( count > max ) {
        max = count;
      }
      
      // If there is data to chart
      if( count > 0 ) {
        // Build column
        beacon = document.createElementNS( 'http://www.w3.org/2000/svg', 'rect' );
        beacon.setAttributeNS( null, 'x', ( b * width ) + ( width / 2 ) - ( ( width / 3 ) / 2 ) );
        beacon.setAttributeNS( null, 'y', 59 - ( ( 58 / max ) * count ) );
        beacon.setAttributeNS( null, 'width', width / 3 );
        beacon.setAttributeNS( null, 'height', ( 58 / max ) * count );
        beacon.setAttributeNS( null, 'fill', 'white' );
        beacon.setAttributeNS( null, 'stroke', 'none' );
        beacon.setAttributeNS( null, 'rx', 2 );
        beacon.setAttributeNS( null, 'ry', 2 );
        this.columns.appendChild( beacon );
      }
    }

    // If there is a maximum value
    // Which means there is some data
    if( max >= 0 ) {
      this.peak.textContent = max;
    } else {
      // No data available
      this.peak.textContent = '0';
    }
  }

  load( id ) {
    this.location.style.display = 'none';

    this.xhr.addEventListener( 'load', this.doMapLoad );
    this.xhr.open( 'GET', '/api/cloudant/map/' + id, true );
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
    // Update history
    // Chart new history
    evt.visitedAt = Date.now();
    this.model.history.push( {
      major: evt.major,
      minor: evt.minor,
      visitedAt: Date.now()
    } );
    this.chart();

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
          text: 'Kevin, you are ' + evt.label + '.',
          token: this.token
        } );        

        break;
      }
    }
  }

  doBrandClick( evt ) {
    this.brand.classList.toggle( 'hover' );
  }

  doLocationChange( evt ) {
    var start = null;
    var end = null;

    var major = parseInt( this.start.children[this.start.selectedIndex].getAttribute( 'data-major' ) );
    var minor = parseInt( this.start.children[this.start.selectedIndex].getAttribute( 'data-minor' ) );    

    console.log( 'Start: ' + major + ' (major), ' + minor + ' (minor)' );

    for( let a = 0; a < this.model.map.areas.length; a++ ) {
      if( 
        this.model.map.areas[a].major == major &&
        this.model.map.areas[a].minor == minor
      ) {
        start = this.model.map.areas[a];
        break;
      }
    }

    var major = parseInt( this.end.children[this.end.selectedIndex].getAttribute( 'data-major' ) );
    var minor = parseInt( this.end.children[this.end.selectedIndex].getAttribute( 'data-minor' ) );    

    console.log( 'End: ' + major + ' (major), ' + minor + ' (minor)' );

    for( let a = 0; a < this.model.map.areas.length; a++ ) {
      if( 
        this.model.map.areas[a].major == major &&
        this.model.map.areas[a].minor == minor
      ) {
        end = this.model.map.areas[a];
        break;
      }
    }

    console.log( start );
    console.log( end );

    let matrix = new PF.Grid( this.model.map.matrix );
    let finder = new PF.AStarFinder( {
      allowDiagonal: true, 
      dontCrossCorners: true
    } );
    let path = finder.findPath( 
      start.x + Math.round( start.width / 2 ), 
      start.y + Math.round( start.height / 2 ), 
      end.x + Math.round( end.width / 2 ), 
      end.y + Math.round( end.height / 2 ),
      matrix
    );

    // TODO: Path smoothing
    console.log( path );

    while( this.navigation.children.length > 0 ) {
      this.navigation.removeChild( this.navigation.children[0] );
    }

    let d = '';
    let ratio = this.map.clientWidth / this.model.map.width;
    let ration = this.map.clientHeight / this.model.map.height;    

    for( let p = 0; p < path.length; p++ ) {
      if( p == 0 ) {
        d = 'M' + ( path[p][0] * ratio ) + ',' + ( path[p][1] * ratio );
      } else {
        d = d + ' L' + ( path[p][0] * ratio ) + ',' + ( path[p][1] * ratio );
      }
    }

    let element = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
    element.setAttributeNS( null, 'fill', 'none' );
    element.setAttributeNS( null, 'stroke-width', 3 );
    element.setAttributeNS( null, 'stroke', 'red' );
    element.setAttributeNS( null, 'd', d );
    this.navigation.appendChild( element );
  }

  doMapImageLoad( evt ) {
    let bounds = this.map.getBoundingClientRect();

    this.navigation.setAttribute( 'width', this.map.clientWidth );
    this.navigation.setAttribute( 'height', this.map.clientHeight );
    this.navigation.style.top = bounds.top + 'px'
  }

  doMapLoad( evt ) {
    this.model = JSON.parse( this.xhr.responseText );

    this.previous.style.display = 'block';
    this.map.src = '/maps/' + this.model.map.vector;
    this.next.style.display = 'block';

    this.populate( this.start, this.model.beacons );
    this.populate( this.end, this.model.beacons );

    this.chart();

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
    this.xhr.open( 'GET', '/api/cloudant/maps', true );
    this.xhr.send( null );
  }

}

let app = new Location();
