class Auction {
  constructor() {
    this.model = {
      email: null
    };

    this.blockchain = new Blockchain();
    this.blockchain.addEventListener( Blockchain.LOGIN_EVENT, evt => this.doLoginComplete( evt ) );

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
  }

  doActionClick( evt ) {
    this.capture.show();
  }

  doAddAsset( evt ) {
    console.log( evt.detail );
    evt.detail.owner = this.model.email;
    this.blockchain.addVehicle( evt.detail );
    this.capture.hide();
    this.owned.push( evt.detail );
  }

  doLogin( evt ) {
    this.blockchain.login( evt.detail.email );
  }

  doLoginComplete( evt ) {
    this.model.email = evt;
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
    this.blockchain.signup( evt.detail );
  }
}

let app = new Auction();
