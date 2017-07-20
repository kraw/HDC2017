class Grid {
  constructor() {
    this.offset = new Stepper( '#offset' );
    this.offset.root.addEventListener( 'stepper_change', evt => this.doOffset( evt ) );    

    this.sizing = new Stepper( '#sizing' );
    this.sizing.root.addEventListener( 'stepper_change', evt => this.doSizing( evt ) );

    this.root = document.createElement( 'div' );
    this.root.id = 'grid';
    document.body.insertBefore( this.root, this.sizing.root );

    this.generate( 5 );
  }

  get dimensions() {
    let last = this.root.querySelector( 'div:last-of-type > div:last-of-type' );
    let position = last.getAttribute( 'data-position' );
    let coordinates = position.split( ',' );

    return {
      width: parseInt( coordinates[0] ),
      height: parseInt( coordinates[1] )
    };
  }

  get height() {
    return this.dimensions.height;
  }

  get width() {
    return this.dimensions.width;
  }

  clear() {
    while( this.root.children.length > 0 ) {
      this.root.children[0].remove();
    }
  }

  generate( size ) {
    for( let y = 0; y < window.innerHeight + 200; y = y + size ) {
      let row = document.createElement( 'div' );
      for( let x = 0; x < window.innerWidth + 200; x = x + size ) {
        let element = document.createElement( 'div' );
        element.classList.add( 'cell' );
        element.addEventListener( 'mouseover', evt => this.doOver( evt ) );
        element.addEventListener( 'mouseout', evt => this.doOut( evt ) );        
        element.addEventListener( 'mousedown', evt => this.doDown( evt ) );
        element.addEventListener( 'mousemove', evt => this.doMove( evt ) );
        element.setAttribute( 'data-position', ( x / size ) + ',' + ( y / size ) );
        element.style.width = size + 'px';
        element.style.height = size + 'px';
        row.appendChild( element );
      }
      this.root.appendChild( row );
    }  

    console.log( this.dimensions );
  }

  hide() {
    this.root.style.display = 'none';

    this.offset.hide();
    this.sizing.hide();    
  }

  show() {
    this.root.style.display = 'block';

    this.offset.show();
    this.sizing.show();    
  }

  map() {
    let matrix = new Array( this.dimensions.height ).fill( 0 ).map( row => new Array( this.dimensions.width ).fill( 0 ) );
    let walls = this.root.querySelectorAll( 'div.cell' );

    for( let w = 0; w < walls.length; w++ ) {
      // let position = this.root.children[c].getAttribute( 'data-position' );
      let position = walls[w].getAttribute( 'data-position' );

      let parts = position.split( ',' );
      let coordinates = {
        x: parseInt( parts[0] ),
        y: parseInt( parts[1] )
      };

      matrix[coordinates.x, coordinates.y] = walls[w].classList.contains( 'selected' ) ? 1 : 0;
    }

    return matrix;
  }

  toggle( element ) {
    if( element.classList.contains( 'selected' ) ) {
      element.classList.remove( 'selected' );
    } else {
      element.classList.add( 'selected' );
    }
  }

  update( size ) {
    for( let c = 0; c < this.root.children.length; c++ ) {
      this.root.children[c].style.width = size + 'px';
      this.root.children[c].style.height = size + 'px';      
    }
  }

  doDown( evt ) {
    evt.preventDefault();
    this.toggle( evt.target );
    console.log( evt.target.getAttribute( 'data-position' ) );
  }

  doMove( evt ) {
    // evt.preventDefault();
  }

  doOffset( evt ) {
    this.root.style.left = evt.detail + 'px';    
  }

  doOut( evt ) {
    evt.target.classList.remove( 'highlight' );
  }

  doOver( evt ) {
    evt.target.classList.add( 'highlight' );

    if( evt.buttons == 1 ) {
      this.toggle( evt.target );
    }
  }

  doSizing( evt ) {
    this.update( evt.detail );
  }
}
