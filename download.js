import crypto from 'crypto';
import net from 'net';
import torrentParser from './torrent-parser.js';

const failedPeers = new Set();

export default (peer, torrent, pieces) => {
  if (failedPeers.has(`${peer.ip}:${peer.port}`)) {
    console.log(`Skipping failed peer: ${peer.ip}:${peer.port}`);
    return;
  }

  const socket = net.Socket();
  let retryDelay = 5000; // Initial retry delay

  const connectWithRetry = (retries = 3) => {
    let attempt = 0;

    const tryConnect = () => {
      if (attempt < retries) {
        socket.connect(peer.port, peer.ip, () => {
          console.log(`Connected to peer: ${peer.ip}:${peer.port}`);
          socket.write(buildHandshake(torrent));
        });

        socket.on('error', (err) => {
          console.error(`Connection error with ${peer.ip}:${peer.port} - ${err.code}: ${err.message}. Retrying in ${retryDelay / 1000} seconds...`);
          failedPeers.add(`${peer.ip}:${peer.port}`);
          setTimeout(tryConnect, retryDelay);
          retryDelay *= 2; // Exponential backoff
        });
      } else {
        console.error(`Failed to connect to peer: ${peer.ip}:${peer.port} after ${retries} attempts`);
      }
      attempt++;
    };

    tryConnect();
  };

  socket.on('data', data => {
    console.log(`Received data from peer: ${data.length} bytes`);
  
  });

  socket.on('close', () => {
    console.log('Connection closed');
  });

  connectWithRetry();
};

const buildHandshake = (torrent) => {
  const buf = Buffer.alloc(68);
  buf.writeUInt8(19, 0);
  buf.write('BitTorrent protocol', 1);
  buf.writeUInt32BE(0, 20);
  buf.writeUInt32BE(0, 24);
  torrentParser.infoHash(torrent).copy(buf, 28);
  crypto.randomBytes(20).copy(buf, 48);
  return buf;
};

