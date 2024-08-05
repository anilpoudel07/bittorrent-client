import fs from 'fs';
import torrentParser from './torrent-parser.js';
import getPeers from './tracker.js';
import Pieces from './pieces.js';
import download from './download.js';

const torrentPath = './sample.torrent';
const downloadPath = './downloads/sample.txt'

const torrent = torrentParser.open(torrentPath);

getPeers(torrent, peers => {
  console.log('Peers:', peers);

  const pieces = new Pieces(torrent);
  const file = fs.openSync(downloadPath, 'w');

  peers.forEach(peer => {
    try {
      download(peer, torrent, pieces, file);
    } catch (err) {
      console.error(`Error downloading from peer: ${err.message}`);
    }
  });

  fs.closeSync(file);
});
