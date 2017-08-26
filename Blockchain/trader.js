class Trader {
  constructor() {
    this.login = new Login();
    this.capture = new Capture();
    
    this.action = document.querySelector( 'button.action' );
    this.action.addEventListener( 'click', evt => this.doAction( evt ) );
  }

  doAction( evt ) {
    this.capture.show();
  }
}

let app = new Trader();
