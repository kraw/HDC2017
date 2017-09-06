class Login {
  constructor() {
    this.state = Login.LOGIN;

    this.root = document.querySelector( '#login' );

    this.tabs = document.querySelectorAll( 'div.tabs > button' );
    this.tabs[0].addEventListener( 'click', evt => this.doTab( evt ) );
    this.tabs[1].addEventListener( 'click', evt => this.doTab( evt ) );    

    this.signup = this.root.querySelector( 'div.signup' );
    this.first = this.signup.querySelector( 'input:first-of-type' );
    this.last = this.signup.querySelector( 'input:last-of-type' );

    this.email = this.root.querySelector( 'div.email > input' );
    
    this.submit = this.root.querySelector( 'div.submit > button' );
    this.submit.addEventListener( 'click', evt => this.doSubmit( evt ) );
  }

  hide() {
    this.root.style.display = 'none';
  }

  show() {
    this.root.style.visibility = 'hidden';
    this.root.style.display = 'flex';
    this.root.style.left = Math.round( ( window.innerWidth - this.root.clientWidth ) / 2 ) + 'px';
    this.root.style.top = Math.round( ( window.innerHeight - this.root.clientHeight ) / 2 ) + 'px';    
    this.root.style.visibility = 'visible';
  }

  doSubmit( evt ) {
    let event = null;

    if( this.state == Login.LOGIN ) {
      event = new CustomEvent( Login.LOGIN_EVENT, {
        detail: {
          email: this.email.value.trim()
        }
      } );
    } else {
      event = new CustomEvent( Login.SIGN_UP_EVENT, {
        detail: {
          first: this.first.value.trim(),
          last: this.last.value.trim(),
          email: this.email.value.trim()
        }
      } );
    }

    this.root.dispatchEvent( event );
  }

  doTab( evt ) {
    for( let b = 0; b < this.tabs.length; b++ ) {
      if( evt.target == this.tabs[b] ) {
        this.tabs[b].classList.add( 'selected' );
      } else {
        this.tabs[b].classList.remove( 'selected' );
      }
    }

    if( evt.target.innerHTML == Login.SIGN_UP ) {
      this.signup.classList.add( 'show' );
      this.submit.innerHTML = Login.SIGN_UP;     
      this.state = Login.SIGN_UP;       
    } else {
      this.signup.classList.remove( 'show' );
      this.submit.innerHTML = Login.LOGIN;            
      this.state = Login.LOGIN;             
    }
  }
}

Login.LOGIN = 'Login';
Login.LOGIN_EVENT = 'login';
Login.SIGN_UP = 'Sign Up';
Login.SIGN_UP_EVENT = 'signup';
