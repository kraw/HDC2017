class Auction {
  constructor() {
    this.login = new Login();
    this.login.root.addEventListener( Login.LOGIN_EVENT, evt => this.doLogin( evt ) );
    this.login.root.addEventListener( Login.SIGN_UP_EVENT, evt => this.doSignUp( evt ) );

    this.toolbar = new Toolbar();
    this.toolbar.root.addEventListener( Toolbar.LOGOUT_EVENT, evt => this.doLogout( evt ) );

    this.xhr = new XMLHttpRequest();
  }

  doLogin( evt ) {
    console.log( evt.detail );
    this.login.hide();
    this.toolbar.show();
  }

  doLogout( evt ) {
    this.toolbar.hide();
    this.login.show();
  }

  doSignUp( evt ) {

  }
}

let app = new Auction();
