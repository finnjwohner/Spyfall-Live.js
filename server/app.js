const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const locations = require('./locations_sv.js');
const roles = require('./roles_sv.js');
const room = require('./rooms_sv.js');

// Initialise the rooms
const rooms = new Map();

// Set directory for public static files
app.use(express.static(path.join(__dirname, '../public')));

app.all('/', (req, res) => {
    res.sendFile(path.join(__dirnname, '../public/index.html'));
})

app.all('/rules', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/rules.html'));
})

app.all('/:roomCode', (req, res) => {
    const roomCode = req.params.roomCode;
    if (rooms.has(roomCode)) {
        // Check if game is full then
        // Join game...
    } else {
        // Invalid code
    }
    res.sendFile(path.join(__dirname, '../public/room.html'));
})

io.on("connection", socket => {
    console.log('new connection');
    const player = {
        playerSocketID: socket.io,
        username: 'Joining',
    }

    // User clicked the start new game button
    // This function will assign a new room to them and
    // return the room code back to the user
    socket.on('requestStartGame', () => {
        let newRoomCode = null;
        do {
            newRoomCode = Math.floor(Math.random() * 100000).toString();
            while (newRoomCode.length < 5) {
                newRoomCode = "0" + newRoomCode;
            }
        } while (rooms.has(newRoomCode));
        const newRoom = new room.Room();
        rooms.set(newRoomCode, newRoom);

        socket.emit('acceptStartGameRequest', newRoomCode);
    })

    socket.on('requestJoinGame', roomCode => {
    })

    socket.on('joinGame', (username, roomCode) => {
        player.username = username;
        const tempRoom = rooms.get(roomCode);
        tempRoom.players
        tempRoom.players.push(player);
        rooms.set(roomCode, tempRoom);
    })
})

const port = process.env.PORT || 3000
server.listen(port, () => {
    console.log(`SpyFall.Live server now running on ${server.address().address}:${port}`);
})