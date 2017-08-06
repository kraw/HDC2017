class Simulator {

  constructor() {
    this.map = document.querySelector( 'img' );
    this.map.addEventListener( 'click', evt => this.doMapClick( evt ) );

    this.label = document.querySelector( 'p' );

    this.socket = io();

    this.model = null;

    this.xhr = new XMLHttpRequest();
    this.xhr.addEventListener( 'load', evt => this.doMapLoad( evt ) );
    this.xhr.open( 'GET', '/api/cloudant/hoxton', true );
    this.xhr.send( null );
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
            this.socket.emit( 'beacon', this.model.beacons[b] );
            break;
          }
        }
        break;
      }
    }
  }

  doMapLoad( evt ) {
    this.model = JSON.parse( this.xhr.responseText );

    this.map.src = "/img/" + this.model.map.vector;
    this.label.innerHTML = this.model.name;
  }

}

let app = new Simulator();
