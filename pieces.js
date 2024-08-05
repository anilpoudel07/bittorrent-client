export default class Pieces {
    constructor(torrent) {
      this.torrent = torrent;
      this.requested = new Array(torrent.info.pieces.length / 20).fill(false);
      this.received = new Array(torrent.info.pieces.length / 20).fill(false);
    }
  
    addRequested(pieceIndex) {
      this.requested[pieceIndex] = true;
    }
  
    addReceived(pieceIndex) {
      this.received[pieceIndex] = true;
    }
  
    needed(pieceIndex) {
      if (this.requested.every(i => i)) {
        this.requested = this.received.slice();
      }
      return !this.requested[pieceIndex];
    }
  
    isDone() {
      return this.received.every(i => i);
    }
  }
  