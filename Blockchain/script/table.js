class Table {
  constructor() {
    this.root = document.querySelector( '#table' );
  }

  hide() {
    this.root.style.display = 'none';
  }

  show() {
    this.root.style.display = 'flex';
  }
}
