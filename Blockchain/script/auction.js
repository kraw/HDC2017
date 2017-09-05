class Auction {
  constructor() {
    this.login = new Login();
    this.login.root.addEventListener( Login.LOGIN_EVENT, evt => this.doLogin( evt ) );
    this.login.root.addEventListener( Login.SIGN_UP_EVENT, evt => this.doSignUp( evt ) );
    this.login.show();

    this.capture = new Capture();
    this.capture.root.addEventListener( Capture.SAVE_EVENT, evt => this.doAddAsset( evt ) );

    this.bid = new Bid();
    this.current = new Current();
    this.owned = new Owned();    

    this.action = document.querySelector( 'button.action' );
    this.action.addEventListener( 'click', evt => this.doActionClick( evt ) );

    this.xhr = new XMLHttpRequest();
  }

  doActionClick( evt ) {
    this.capture.show();
  }

  doAddAsset( evt ) {
    this.capture.hide();
    this.owned.push( evt.detail );
  }

  doLogin( evt ) {
    console.log( evt.detail );
    this.login.hide();
    this.bid.show();
    this.action.style.display = 'block';
  }

  doLogout( evt ) {
    this.action.style.display = 'none';    
    this.bid.hide();
    this.login.show();    
  }

  doSignUp( evt ) {

  }
}

let app = new Auction();
