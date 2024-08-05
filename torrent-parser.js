import fs from 'fs';
import bencode from 'bencode';
import crypto from 'crypto';

const open = (filepath) => {
  return bencode.decode(fs.readFileSync(filepath));
};

const infoHash = (torrent) => {
  const info = bencode.encode(torrent.info);
  return crypto.createHash('sha1').update(info).digest();
};

const size = (torrent) => {
  const size = torrent.info.files
    ? torrent.info.files.map(file => file.length).reduce((a, b) => a + b)
    : torrent.info.length;

  return size;
};

const pieceLength = (torrent, pieceIndex) => {
  const totalLength = size(torrent);
  const pieceLength = torrent.info['piece length'];
  const lastPieceLength = totalLength % pieceLength;

  return pieceIndex === Math.floor(totalLength / pieceLength) ? lastPieceLength : pieceLength;
};

export default { open, infoHash, size, pieceLength };
