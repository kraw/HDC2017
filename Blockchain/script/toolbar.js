class Toolbar {
  constructor() {
    this.root = document.querySelector( '#toolbar' );

    this.logout = this.root.querySelector( 'div.items > button:last-of-type' );
    this.logout.addEventListener( 'click', evt => this.doLogout( evt ) );
  }

  hide() {
    this.root.style.display = 'none';
  }

  show() {
    this.root.style.display = 'block';    
  }

  doLogout( evt ) {
    this.root.dispatchEvent( new CustomEvent( Toolbar.LOGOUT_EVENT ) );
  }
}

Toolbar.LOGOUT_EVENT = 'logout';
