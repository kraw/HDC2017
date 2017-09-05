class Capture {
  constructor() {
    // State
    this.stream = null;
    this.streaming = false;

    // Root
    this.root = document.querySelector( '#capture' );

    // Canvas
    this.canvas = this.root.querySelector( 'canvas' );

    // Video
    this.video = this.root.querySelector( 'video' );
    this.video.addEventListener( 'canplay', evt => this.doPlay( evt ) );

    // Description
    this.description = this.root.querySelector( 'input' );

    // Camera
    this.camera = this.root.querySelector( 'button.flat:nth-of-type( 1 )' );
    this.camera.addEventListener( 'click', evt => this.doCamera( evt ) );

    // Cancel
    this.cancel = this.root.querySelector( 'button.flat:nth-of-type( 2 )' );
    this.cancel.addEventListener( 'click', evt => this.doCancel( evt ) );

    // Save
    this.save = this.root.querySelector( 'button.flat:nth-of-type( 3 )' );
    this.save.addEventListener( 'click', evt => this.doSave( evt ) );    
  }

  hide() {
    // Hide card
    this.root.style.opacity = 0;
    this.root.style.display = 'none';
    this.canvas.style.display = 'none';
    this.camera.innerHTML = Capture.CAMERA;
    this.description.value = '';

    // Stop camera
    this.stream.getTracks()[0].stop();
    this.stream = null;
    this.streaming = false;    
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

  doCamera( evt ) {
    if( this.camera.innerHTML == Capture.CAMERA ) {
      // Make still      
      this.camera.innerHTML = Capture.CLEAR;

      this.canvas.setAttribute( 'width', this.video.clientWidth );
      this.canvas.setAttribute( 'height', this.video.clientHeight );
      
      let context = this.canvas.getContext( '2d' );
      context.drawImage( this.video, 0, 0, this.canvas.width, this.canvas.height );
      this.canvas.style.display = 'block';
    } else {
      // Clear still
      this.canvas.style.display = 'none';
      this.camera.innerHTML = Capture.CAMERA;
    }
  }

  doCancel( evt ) {
    // Cancel
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
      
      // Position card
      // Make visible
      this.root.style.display = 'flex';
      this.root.style.left = Math.round( ( window.innerWidth - 480 ) / 2 );
      this.root.style.top = Math.round( ( window.innerHeight - this.root.clientHeight ) / 2 );            
      this.root.style.opacity = 1;
    }
  }

  doSave( evt ) {
    // Save
    this.root.dispatchEvent( new CustomEvent( Capture.SAVE_EVENT, {
      detail: {
        vin: uuid.v4(),
        description: this.description.value.trim(),
        photo: this.canvas.toDataURL()
      }
    } ) );
  }
}

Capture.CAMERA = 'Camera';
Capture.CLEAR = 'Clear';
Capture.SAVE_EVENT = 'save_event';
