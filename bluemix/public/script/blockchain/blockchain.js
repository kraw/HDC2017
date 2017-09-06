class Blockchain {
  constructor() {
    this.data = null;
    this.listeners = new Map();

    this.doMemberCreate = this.doMemberCreate.bind( this );
    this.doMemberLoad = this.doMemberLoad.bind( this );    
    this.doVehicleCreate = this.doVehicleCreate.bind( this );    

    this.xhr = new XMLHttpRequest();
  }

  // http://www.datchley.name/es6-eventemitter/
  addEventListener( label, callback ) {
    this.listeners.has( label ) || this.listeners.set( label, [] );
    this.listeners.get( label ).push( callback );
  }

  emit( label, ...args ) {  
    let listeners = this.listeners.get( label );

    if( listeners && listeners.length ) {
      listeners.forEach( ( listener ) => {
        listener( ...args ); 
      } );
        
      return true;
    }
    
    return false;
  }

  addVehicle( data ) {
    this.data = data;
    
    this.xhr.addEventListener( 'load', this.doVehicleCreate );
    this.xhr.open( 'POST', Blockchain.URL + 'Vehicle', true );
    this.xhr.setRequestHeader( 'Content-Type', 'application/json;charset=UTF-8' );
    this.xhr.send( JSON.stringify( data ) );        
  }

  login( email ) {
    this.data = email;
    this.xhr.addEventListener( 'load', this.doMemberLoad );
    this.xhr.open( 'GET', Blockchain.URL + 'Member', true );
    this.xhr.send();
  }

  signup( data ) {
    this.data = data;

    this.xhr.addEventListener( 'load', this.doMemberCreate );
    this.xhr.open( 'POST', Blockchain.URL + 'Member', true );
    this.xhr.setRequestHeader( 'Content-Type', 'application/json;charset=UTF-8' );
    this.xhr.send( JSON.stringify( {
      balance: 100000,
      email: this.data.email,
      firstName: this.data.first,
      lastName: this.data.last          
    } ) );    
  }

  doMemberCreate( evt ) {
    this.emit( Blockchain.LOGIN_EVENT, this.data.email );

    this.data = null;
    this.xhr.removeEventListener( 'load', this.doMemberCreate );
  }

  doMemberLoad( evt ) {
    let data = JSON.parse( this.xhr.responseText );
    let found = false;

    for( let m = 0; m < data.length; m++ ) {
      if( data[m].email == this.data ) {
        found = true;
        break;
      }
    }

    if( found ) {
      this.emit( Blockchain.LOGIN_EVENT, this.data );
    } else {
      console.log( 'Not logged in.' );
    }

    this.data = null;
    this.xhr.removeEventListener( 'load', this.doMemberLoad );    
  }

  doVehicleCreate( evt ) {
    console.log( evt );
  }
}

Blockchain.URL = 'https://krhoyt.ngrok.io/api/';
Blockchain.LOGIN_EVENT = 'login_event';
