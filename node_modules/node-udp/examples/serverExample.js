const Server = require('../index').Server

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
//server.close()

