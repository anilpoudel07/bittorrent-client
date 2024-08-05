# node-udp
> A simpler UDP client/server API for Node

- Zero dependencies
- Simple API

## Install
`nmp i node-udp`

## Usage
### Server Example
```js
const Server = require('node-udp').Server

const server = new Server({port: 30210, type: 'udp4'})

server.on('listen', data => {
  console.log('UDP Server Listening', data)
})

server.on('connect', ()=> {
  console.log('Connected')
})

// Simple terminal chat app
server.on('data', data => {
  console.log(data.toString())
})
process.stdin.on('data', data => {
  server.send(data)
})

// Close the connection
server.close()
```

### Client Example
```js
const Client = require('node-udp').Client

let client = new Client({server: 'localhost', port: 30210, type: 'udp4'})

client.on('listen', data => {
  console.log('UDP Client Listening', data)
})

client.on('connect', ()=> {
  console.log('Connected')
})

// Simple chat app
client.on('data', data => {
  console.log(data.toString())
})
process.stdin.on('data', data => {
  client.send(data)
})

// Close the connection
client.close()
```