import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 8088 })
wss.on('connection', (socket) => {
    socket.on('message', (msg) => {
        wss.clients.forEach(item => {
            item.send(msg)
        })
    })
})

