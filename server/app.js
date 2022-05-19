const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const locations = require('./locations_sv.js');
const roles = require('./roles_sv.js');

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

app.all('/sitemap', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/sitemap.xml'));
})

app.all('/:roomCode', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/room.html'));
})

io.on("connection", socket => {
    const player = {
        socketID: socket.id,
        username: 'Joining',
        roomCode: '',
        playing: false,
        joined: false,
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

        console.log(`Creating room (${newRoomCode})`);
        const players = [ ];
        players.started = false;
        rooms.set(newRoomCode, players);

        socket.emit('acceptStartGameRequest', newRoomCode);
    })

    socket.on('requestJoinGame', roomCode => {
        if (!rooms.has(roomCode)) {
            socket.emit('unknownGameReject', roomCode);
            return;
        }
        const tempPlayers = rooms.get(roomCode);

        if(tempPlayers.length >= 8) {
            console.log(`User (${socket.id}) rejected from room (${roomCode}). Room Full`);
            socket.emit('fullGameReject');
        } else {
            socket.join(roomCode);
            player.roomCode = roomCode;
            tempPlayers.push(player);

            io.to(roomCode).emit("playerChange", tempPlayers);
            
            rooms.set(roomCode, tempPlayers);
            console.log(`User (${socket.id}) joined room (${roomCode})`);
        }
    })

    socket.on('joinGame', (username, roomCode) => {
        player.username = username;
        player.joined = true;
        const tempPlayers = rooms.get(roomCode);

        for(i = 0; i < tempPlayers.length; i++) {
            if (tempPlayers[i].socketID == socket.io) {
                tempPlayers[i] = player;
            }
        }

        io.to(roomCode).emit("playerChange", tempPlayers);
        socket.emit('stateSet', tempPlayers.started);

        rooms.set(roomCode, tempPlayers);
    })

    socket.on('disconnect', () => {
        if (player.roomCode == '') { return; }

        console.log(`User (${socket.id}) disconnected from room (${player.roomCode})`);

        socket.leave(player.roomCode);
        const tempPlayers = rooms.get(player.roomCode);
        for(i = 0; i < tempPlayers.length; i++) {
            if (tempPlayers[i].socketID == socket.id) {
                tempPlayers.splice(i, 1);
            }
        }

        if (tempPlayers.length > 0) {
            io.to(player.roomCode).emit("playerChange", tempPlayers);
            rooms.set(player.roomCode, tempPlayers);
        } else {
            console.log(`Clearing Room (${player.roomCode})`);
            rooms.delete(player.roomCode);
        }
    })

    // Start a game:
    // 1. Set every player that isn't currently joining to playing
    // 2. Assign a random player as spy
    // 3. Assign a random location
    // 4. Assign every other player that isn't a spy a role
    socket.on('startStopGame', () => {
        if (!rooms.has(player.roomCode)) { return; }

        const tempPlayers = rooms.get(player.roomCode);
        if (tempPlayers.started) {
            tempPlayers.started = false;
            io.to(player.roomCode).emit("stateChange", false);
            io.to(player.roomCode).emit('assigmment', 'Location', 'Role');
        } else {
            let playingCount = 0;

            for(i = 0; i < tempPlayers.length; i++) {
                if (tempPlayers[i].joined) {
                    tempPlayers[i].playing = true;
                    playingCount++;
                }
            }

            if (playingCount > 0) {
                tempPlayers.started = true;
                io.to(player.roomCode).emit("stateChange", true, socket.id);

                let spyIndex = 0;
                do {
                    spyIndex = Math.floor(Math.random()*tempPlayers.length)
                } while (!tempPlayers[spyIndex].joined);

                io.to(tempPlayers[spyIndex].socketID).emit('assigmment', 'Spy', '<br>');

                locationIndex = Math.floor(Math.random()*24);
                let assignedRoles = [];

                tempPlayers.forEach(player => {
                    if(player.joined) {
                        if (player.socketID != tempPlayers[spyIndex].socketID) {
                            let role  = '';
                            do {
                                role = roles.roles[locationIndex][Math.floor(Math.random()*7)];
                            } while(assignedRoles.includes(role));
                            assignedRoles.push(role);
                            io.to(player.socketID).emit('assigmment', locations.locations[locationIndex], role);
                        }
                    }
                })
                
                io.to(player.roomCode).emit("playerChange", tempPlayers);
                rooms.set(player.roomCode, tempPlayers);
            }
        }
    })
})

const port = process.env.PORT || 3000
server.listen(port, () => {
    console.log(`SpyFall.Live server now running on ${server.address().address}:${port}`);
})