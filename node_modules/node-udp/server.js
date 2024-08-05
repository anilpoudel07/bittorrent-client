const dgram = require('dgram')
const EventEmitter = require('events').EventEmitter

const Server = function(params){
  let udp = this
  if(params) Object.fromEntries(Object.entries(params).map(([k, v]) => {
    return [udp[k] = v]
  }))

  let events = new EventEmitter()
  udp.on = events.on.bind(events)
  udp.once = events.once.bind(events)
  udp.off = events.off.bind(events)
  udp.emit = events.emit.bind(events)
  udp.send = () => {}
  udp.close = () => {}

  const server = dgram.createSocket(udp.type)
  udp.close = server.close.bind(server)

  server.on('error', (error) => {
    console.log("udp_server", "error", error)
    server.close()
  })

  server.on('message', (msg,info) => {
    if(msg.toString()==='connect'){
      udp.emit('connect')
      udp.info = info
      server.send('connect', info.port, info.address, (error, bytes) => {
        if(error){
          udp.emit('error', error)
          server.close()
          process.exit(1)
        }
      })
      udp.send = (data) => server.send(data, info.port, info.address, (error, bytes) => {
        if(error){
          udp.emit('error', error)
          server.close()
        }
      })
      return
    }
    udp.emit('data', msg)
  })

  server.on('listening', () => {
    let address = server.address()    
    udp.emit('listen', address)
  })

  server.on('close', () => {
    udp.emit('close')
  })

  server.bind(udp.port)
}

module.exports = Server
