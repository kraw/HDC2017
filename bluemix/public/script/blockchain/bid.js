class Bid {
  constructor() {
    this.root = document.querySelector( '#bid' );
  }

  show() {
    this.root.style.display = 'flex';
  }

  hide() {
    this.root.style.display = 'none';
  }
}
