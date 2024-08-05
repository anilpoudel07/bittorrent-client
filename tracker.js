import dgram from 'dgram'; // Import dgram for UDP
import crypto from 'crypto';
import torrentParser from './torrent-parser.js';

const getPeers = (torrent, callback) => {
  const socket = dgram.createSocket('udp4'); // Create a UDP socket using dgram

  // Convert the announce URL buffer to a string correctly
  const urlStr = Buffer.from(torrent.announce).toString('utf8');
  console.log('Announce URL Buffer:', torrent.announce);
  console.log('Decoded Announce URL:', urlStr);

  let url;

  try {
    url = new URL(urlStr);
  } catch (err) {
    console.error('Invalid URL:', urlStr);
    return;
  }

  socket.on('message', response => {
    if (responseType(response) === 'connect') {
      const connectionResponse = parseConnectionResponse(response);
      const announceRequest = buildAnnounceRequest(connectionResponse.connectionId, torrent);
      socket.send(announceRequest, 0, announceRequest.length, url.port, url.hostname);
    } else if (responseType(response) === 'announce') {
      const announceResponse = parseAnnounceResponse(response);
      callback(announceResponse.peers);
    }
  });

  const connectionRequest = buildConnectionRequest();
  socket.send(connectionRequest, 0, connectionRequest.length, url.port, url.hostname);
};

const buildConnectionRequest = () => {
  const buf = Buffer.allocUnsafe(16);
  buf.writeUInt32BE(0x417, 0);
  buf.writeUInt32BE(0x27101980, 4);
  buf.writeUInt32BE(0, 8);
  crypto.randomBytes(4).copy(buf, 12);
  return buf;
};
const buildAnnounceRequest = (connectionId, torrent) => {
    const buf = Buffer.allocUnsafe(98);
    connectionId.copy(buf, 0); // Copy connection ID into the buffer
    buf.writeUInt32BE(1, 8);   // Action: announce
    crypto.randomBytes(4).copy(buf, 12); // Transaction ID
    torrentParser.infoHash(torrent).copy(buf, 16); // Info hash
    crypto.randomBytes(20).copy(buf, 36); // Peer ID
  
    // Helper function to write 64-bit unsigned integers as two 32-bit integers
    const writeUInt64BE = (buf, value, offset) => {
      buf.writeUInt32BE(Math.floor(value / 0x100000000), offset); // High 32 bits
      buf.writeUInt32BE(value % 0x100000000, offset + 4); // Low 32 bits
    };
  
    writeUInt64BE(buf, 0, 56); // Downloaded (64-bit integer)
    writeUInt64BE(buf, 0, 64); // Left (64-bit integer)
    writeUInt64BE(buf, 0, 72); // Uploaded (64-bit integer)
  
    buf.writeUInt32BE(0, 80); // Event: 0 (none)
    buf.writeUInt32BE(0, 84); // IP address (0 for any)
    buf.writeUInt16BE(6881, 92); // Port number
    buf.writeUInt32BE(0, 94); // Request ID (0 for any)
  
    return buf;
  };
  
  

const responseType = (response) => {
  const action = response.readUInt32BE(0);
  if (action === 0) return 'connect';
  if (action === 1) return 'announce';
};

const parseConnectionResponse = (response) => {
  return {
    action: response.readUInt32BE(0),
    transactionId: response.readUInt32BE(4),
    connectionId: response.slice(8)
  };
};

const parseAnnounceResponse = (response) => {
  function group(iterable, groupSize) {
    let groups = [];
    for (let i = 0; i < iterable.length; i += groupSize) {
      groups.push(iterable.slice(i, i + groupSize));
    }
    return groups;
  }

  return {
    action: response.readUInt32BE(0),
    transactionId: response.readUInt32BE(4),
    interval: response.readUInt32BE(8),
    leechers: response.readUInt32BE(12),
    seeders: response.readUInt32BE(16),
    peers: group(response.slice(20), 6).map(address => {
      return {
        ip: address.slice(0, 4).join('.'),
        port: address.readUInt16BE(4)
      };
    })
  };
};

export default getPeers;
