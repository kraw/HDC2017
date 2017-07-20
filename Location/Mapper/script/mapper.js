class Mapper {
  constructor() {
    this.reader = new FileReader();
    this.reader.addEventListener( 'load', evt => this.doRead( evt ) );

    document.body.addEventListener( 'dragover', evt => this.doDrag( evt ) );
    document.body.addEventListener( 'drop', evt => this.doDrop( evt ) );

    this.grid = new Grid();
    this.map = null;
  }

  export() {
    let grid = new PF.Grid( this.grid.map() );
    let finder = new PF.AStarFinder();
    let path = finder.findPath( 75, 57, 127, 73, grid );

    for( let p = 0; p < path.length; p++ ) {
      let query = 'div[data-position="' + path[p][0] + ',' + path[p][1] + '"]';
      let element = this.grid.root.querySelector( query );
      element.style.backgroundColor = 'red';
    }

    // return this.grid.map();
  }

  doDrag( evt ) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
  }

  doDrop( evt ) {
    evt.stopPropagation();
    evt.preventDefault();
    this.reader.readAsDataURL( evt.dataTransfer.files[0] );    
  }

  doLoad( evt ) {
    this.grid.show();
  }

  doRead( evt ) {
    this.map = document.createElement( 'img' );
    this.map.id = 'map';
    this.map.addEventListener( 'load', evt => this.doLoad( evt ) );
    this.map.src = evt.target.result;    
    document.body.insertBefore( this.map, this.grid.root );
  }
}

let app = new Mapper();
