const express = require('express');
const { ExpressPeerServer } = require('peer')
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 9000;
const { v4: uuidV4 } = require('uuid');
const roomId = uuidV4()
http.listen(PORT, () => {
    console.log(`listen on port ${PORT}`);
});
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', {roomId: roomId});
});

io.on('connection', (socket) => {
    console.log(`user uuid : ${roomId}`)
    console.log(`client is connected ${socket.id}`);
    socket.on('join-room', (roomId, userId) => {
        console.log(roomId, userId);
        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', userId)
    })
    socket.on("userMessage", (data) => {
        io.sockets.emit("userMessage", data);
        console.log(data);
        socket.on("userTyping", (data) => {
            socket.broadcast.emit('userTyping', data);
        });
    });
});