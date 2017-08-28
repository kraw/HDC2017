class Trader {
  constructor() {
    // Login
    this.login = new Login();
    this.login.root.addEventListener( 'login', evt => this.doLogin( evt ) );

    // Capture
    this.capture = new Capture();

    // List
    this.list = new List();
    
    // Action
    this.action = document.querySelector( 'button.action' );
    this.action.addEventListener( 'click', evt => this.doAction( evt ) );
  }

  // Add new assets
  doAction( evt ) {
    this.capture.show();
  }

  // Login participant
  doLogin( evt ) {
    console.log( evt.detail );

    model.participant = evt.detail;

    this.login.hide();
    this.action.style.display = 'block';
    
    // TODO: Populate
    this.list.show();
  }
}

// Instantiate application
let app = new Trader();
