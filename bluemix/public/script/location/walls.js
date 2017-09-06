class Walls {

  constructor() {
    this.xhr = new XMLHttpRequest();
    this.xhr.addEventListener( 'load', evt => this.doFileUpload( evt ) );

    document.body.addEventListener( 'dragover', evt => this.doDragOver( evt ) );
    document.body.addEventListener( 'drop', evt => this.doDragDrop( evt ) );

    this.canvas = document.querySelector( 'canvas' );
    this.context = null;

    this.holder = document.querySelector( 'img' );
    this.holder.addEventListener( 'load', evt => this.doImageLoad( evt ) );    
  }

  doDragDrop( evt ) {
    evt.stopPropagation();
    evt.preventDefault();

    let form = new FormData();
    form.append('image', evt.dataTransfer.files[0] );
    
    this.xhr.open( 'POST', '/api/walls/upload', true );
    this.xhr.send( form );
  }

  doDragOver( evt ) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';    
  }

  doFileUpload( evt ) {
    console.log( this.xhr.responseText );    
    this.holder.src = '/uploads/' + this.xhr.responseText;
  }

  doImageLoad( evt ) {
    console.log( this.holder.clientWidth + 'x' + this.holder.clientHeight );

    this.canvas.width = this.holder.clientWidth;
    this.canvas.height = this.holder.clientHeight;

    this.context = this.canvas.getContext( '2d' );      
    this.context.drawImage( this.holder, 0, 0, this.canvas.width, this.canvas.height );       
      
    let pixels = this.context.getImageData( 0, 0, this.canvas.width, this.canvas.height ).data; 
    
    console.log( pixels.length / 4 );
    console.log( pixels[0] + ', ' + pixels[1] + ', ' + pixels[2] + ', ' + pixels[3] );

    let matrix = [];

    for( let r = 0; r < this.canvas.height; r++ ) {
      let row = [];

      for( let c = 0; c < this.canvas.width; c++ ) {
        let offset = ( r * ( this.canvas.width * 4 ) ) + ( ( c * 4 ) + 3 );
        if( pixels[offset] == 0 ) {
          row.push( 0 );
        } else {
          row.push( 1 );
        }
      }

      matrix.push( row );
    }

    console.log( JSON.stringify( matrix ) );
  }

}

let app = new Walls();
