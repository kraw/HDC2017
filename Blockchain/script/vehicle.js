class Vehicle {
  constructor( data ) {
    let template = document.querySelector( '#owned > .item.template' );
    this.root = template.cloneNode( true );
  }
}
