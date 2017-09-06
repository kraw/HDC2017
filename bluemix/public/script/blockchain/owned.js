class Owned {
  constructor() {
    this.root = document.querySelector( '#owned' );
  }

  push( data ) {
    let template = this.root.querySelector( '.item.template' );

    let clone = template.cloneNode( true );
    clone.setAttribute( 'data-vin', data.vin );
    clone.setAttribute( 'data-photo', data.photo );
    clone.setAttribute( 'data-description', data.description );
    clone.style.backgroundImage = 'url( /uploads/' + data.photo + ' )';
    clone.children[0].innerHTML = data.description;
    clone.classList.remove( 'template' );
    
    this.root.appendChild( clone );
  }
}
