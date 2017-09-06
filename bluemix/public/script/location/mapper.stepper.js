class Stepper {
  constructor( path ) {
    this.root = document.querySelector( path );

    this.down = this.root.querySelector( '.decrease' );
    this.down.addEventListener( 'click', evt => this.doDown( evt ) );

    this.up = this.root.querySelector( '.increase' );
    this.up.addEventListener( 'click', evt => this.doUp( evt ) );

    this.input = this.root.querySelector( 'input' );
    this.input.addEventListener( 'keypress', evt => this.doEnter( evt ) );
    this.input.addEventListener( 'blur', evt => this.doBlur( evt ) );
    this.input.addEventListener( 'focus', evt => this.doFocus( evt ) );    

    this.last = null;
  }

  emit( value ) {
    this.root.dispatchEvent( new CustomEvent( 'stepper_change', { 
      detail: value 
    } ) );
  }

  hide() {
    this.root.style.display = 'hide';
  }

  show() {
    this.root.style.display = 'block';
  }

  doBlur( evt ) {
    if( parseInt( this.input.value ) != this.last ) {
      let value = parseInt( this.input.value );
      emit( value );
    }
  }

  doDown( evt ) {
    let value = parseInt( this.input.value ) - 1;

    this.input.value = value;
    this.emit( value );
  }

  doEnter( evt ) {
    if( evt.keyCode == 13 ) {
      this.input.blur();
    }
  }

  doFocus( evt ) {
    this.last = parseInt( this.input.value );
  }

  doUp( evt ) {
    let value = parseInt( this.input.value ) + 1;

    this.input.value = parseInt( this.input.value ) + 1;
    this.emit( value );
  }  
}
