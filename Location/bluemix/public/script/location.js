class Location {

  constructor() {
    this.socket = io();
    this.socket.on( 'beacon', evt => this.doBeaconMessage( evt ) );

    this.token = null;

    this.xhr = new XMLHttpRequest();
    this.xhr.addEventListener( 'load', evt => this.doTokenLoad( evt ) );
    this.xhr.open( 'GET', '/api/tts/token', true );
    this.xhr.send( null );
  }

  doBeaconMessage( evt ) {
    console.log( evt );

    WatsonSpeech.TextToSpeech.synthesize( {
      text: 'Kevin, you are in the ' + evt.name.toLowerCase() + '.',
      token: this.token
    } );
  }

  doTokenLoad( evt ) {
    this.token = this.xhr.responseText;
  }

}

let app = new Location();
