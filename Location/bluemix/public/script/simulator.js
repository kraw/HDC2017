class Simulator {

  constructor() {
    this.map = document.querySelector( '#map' );
    this.map.addEventListener( 'click', evt => this.doMapClick( evt ) );

    this.previous = document.querySelector( 'button:first-of-type' );
    this.previous.addEventListener( 'click', evt => this.doPreviousClick( evt ) );

    this.next = document.querySelector( 'button:last-of-type' );
    this.next.addEventListener( 'click', evt => this.doNextClick( evt ) );

    this.doMapLoad = this.doMapLoad.bind( this );    
    this.doMapsLoad = this.doMapsLoad.bind( this );

    this.index = null;
    this.maps = null;
    this.model = null;

    this.socket = io();

    this.xhr = new XMLHttpRequest();
    this.xhr.addEventListener( 'load', this.doMapsLoad );
    this.xhr.open( 'GET', '/api/cloudant/all', true );
    this.xhr.send( null );
  }

  load( id ) {
    this.xhr.addEventListener( 'load', this.doMapLoad );
    this.xhr.open( 'GET', '/api/cloudant/' + id, true );
    this.xhr.send( null );
  }  

  transform( x, in_min, in_max, out_min, out_max ) {
    return ( x - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
  } 

  doMapClick( evt ) {
    let ratio = {
      width: this.model.map.width / this.map.clientWidth,
      height: this.model.map.height / this.map.clientHeight
    };
    let scaled = {
      x: evt.offsetX * ratio.width,
      y: evt.offsetY * ratio.height
    };

    for( let a = 0; a < this.model.map.areas.length; a++ ) {
      if( 
        scaled.x > this.model.map.areas[a].x &&
        scaled.y > this.model.map.areas[a].y &&
        scaled.x < ( this.model.map.areas[a].x + this.model.map.areas[a].width ) &&
        scaled.y < ( this.model.map.areas[a].y + this.model.map.areas[a].height )
      ) {
        for( let b = 0; b < this.model.beacons.length; b++ ) {
          if( 
            this.model.beacons[b].major == this.model.map.areas[a].major &&
            this.model.beacons[b].minor == this.model.map.areas[a].minor 
          ) {
            console.log( this.model.beacons[b] );
            let message = Object.assign( {}, this.model.beacons[b] );
            message.document = this.model._id;
            this.socket.emit( 'beacon', message );
            break;
          }
        }
        break;
      }
    }
  }

  doMapLoad( evt ) {
    this.model = JSON.parse( this.xhr.responseText );

    this.previous.style.display = 'block';
    this.map.src = '/maps/' + this.model.map.vector;
    this.next.style.display = 'block';

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

}

let app = new Simulator();
