class Login {
  constructor() {
    // Removable listeners
    this.doCreate = this.doCreate.bind( this );
    this.doParticipant = this.doParticipant.bind( this );

    // Elements
    this.root = document.querySelector( '#login' );
    
    this.input = this.root.querySelector( 'input' );
    this.input.addEventListener( 'keypress', evt => this.doInput( evt ) );

    this.button = this.root.querySelector( 'button' );
    this.button.addEventListener( 'click', evt => this.doLogin( evt ) );

    // Data
    this.xhr = new XMLHttpRequest();
  }

  hide() {
    this.root.style.display = 'none';
  }

  show() {
    this.root.style.display = 'flex';
  }

  // Emit event
  // Send participant details
  success( participant ) {
    this.root.dispatchEvent( new CustomEvent( 'login', {
      detail: {
        email: 'krhoyt@us.ibm.com'
      }
    } ) );
  }

  // Participant creation success
  doCreate( evt ) {
    let data = JSON.parse( this.xhr.responseText );

    console.log( data );

    // Clean up
    this.xhr.removeEventListener( 'load', this.doCreate );

    // TODO: Raise login event    
  }

  // Watch for enter key
  doInput( evt ) {
    if( evt.keyCode == 13 ) {
      this.doLogin( evt );
    }
  }

  // Start login process
  doLogin( evt ) {
    if( this.input.value.trim().length > 0 ) {
      // Load participants
      this.xhr.addEventListener( 'load', this.doParticipant );
      this.xhr.open( 'GET', 'test.json', true );
      this.xhr.send( null );
    }
  }

  // Login lookup response
  doParticipant( evt ) {
    let data = JSON.parse( this.xhr.responseText );
    let found = false;

    console.log( data );

    // Clean up
    this.xhr.removeEventListener( 'load', this.doParticipant );

    // Look for match
    for( let p = 0; p < 1; p++ ) {
      found = true;
    }

    if( !found ) {
      // Create
      this.xhr.addEventListener( 'load', this.doCreate );
      this.xhr.open( 'GET', 'test.json', true );
      this.xhr.send( null );
    } else {
      // Success
      this.success();
    }
  }
}
