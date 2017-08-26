class Login {
  constructor() {
    this.root = document.querySelector( '#login' );
    
    this.input = this.root.querySelector( 'input' );
    this.input.addEventListener( 'keypress', evt => this.doInput( evt ) );

    this.button = this.root.querySelector( 'button' );
    this.button.addEventListener( 'click', evt => this.doLogin( evt ) );
  }

  doInput( evt ) {
    if( evt.keyCode == 13 ) {
      this.doLogin( evt );
    }
  }

  doLogin( evt ) {
    if( this.input.value.trim().length > 0 ) {
      this.root.style.display = 'none';
    }
  }
}
