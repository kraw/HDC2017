class List {
  constructor() {
    this.root = document.querySelector( '#list' );
  }

  hide() {
    this.root.style.display = 'none';
  }

  show() {
    this.root.style.display = 'block';
  }
}
