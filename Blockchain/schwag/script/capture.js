class Capture {
  constructor() {
    // State
    this.stream = null;
    this.streaming = false;

    // Root
    this.root = document.querySelector( '#capture' );

    // Video
    this.video = this.root.querySelector( 'video' );
    this.video.addEventListener( 'canplay', evt => this.doPlay( evt ) );

    // Cancel
    this.cancel = this.root.querySelector( 'button.flat:first-of-type' );
    this.cancel.addEventListener( 'click', evt => this.doCancel( evt ) );
  }

  hide() {
    this.root.style.opacity = 0;
    this.root.style.display = 'none';
  }

  show() {
    // Start camera
    navigator.mediaDevices.getUserMedia( { 
      video: true, 
      audio: false 
    } )
    .then( stream => {
      this.stream = stream;
      this.video.srcObject = this.stream;
      this.video.play();      
    } )
    .catch( function( err ) {
      console.log( err );
    } );        
  }

  doCancel( evt ) {
    // Stop camera
    this.stream.getTracks()[0].stop();
    this.stream = null;
    this.streaming = false;

    // Hide card
    this.hide();
  }

  // Layout card
  // Camera display impacts size
  // To be done after camera starts
  doPlay( evt ) {
    // One camera is enough
    if( !this.streaming ) {
      // Preserve aspect ratio
      let height = this.video.videoHeight / ( this.video.videoWidth / 480 );
      
      // Size video display
      this.video.setAttribute( 'width', 480 );
      this.video.setAttribute( 'height', height );

      // Track state
      this.streaming = true;
      
      // Size canvas
      // Used for image capture
      // Not immediately visible
      // canvas.setAttribute( 'width', 480 );
      // canvas.setAttribute( 'height', height );

      // Position card
      // Make visible
      this.root.style.display = 'flex';
      this.root.style.left = Math.round( ( window.innerWidth - 480 ) / 2 );
      this.root.style.top = Math.round( ( window.innerHeight - this.root.clientHeight ) / 2 );            
      this.root.style.opacity = 1;
    }
  }
}
