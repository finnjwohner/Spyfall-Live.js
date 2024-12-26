import sanitizer from "sanitizer";
const { escape } = sanitizer;
import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import path from "path";
import { shuffleArray } from "./util.js";
import { locations } from "./locations_sv.js";
import { roles } from "./roles_sv.js";

const __dirname = import.meta.dirname;
const app = express();
const server = createServer(app);
const io = new Server(server);

// Initialise the rooms
const rooms = new Map();

// Set directory for public static files
app.use(express.static(path.join(__dirname, "../public")));

app.all("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.all("/index", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.all("/robots.txt", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/robots.txt"));
});

app.all("/rules", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/rules.html"));
});

app.all("/sitemap", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/sitemap.xml"));
});

app.all("/:roomCode", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/room.html"));
});

io.on("connection", (socket) => {
  const player = {
    socketID: socket.id,
    username: "Joining",
    roomCode: "",
    playing: false,
    joined: false,
  };

  socket.on("hiddenTab", () => {
    console.log(`player ${player.username} hid tab!`);
  });

  socket.on("visibleTab", () => {
    console.log(`player ${player.username} hid tab!`);
  });

  // User clicked the start new game button
  // This function will assign a new room to them and
  // return the room code back to the user
  socket.on("requestStartGame", () => {
    let newRoomCode = null;
    do {
      newRoomCode = Math.floor(Math.random() * 100000).toString();
      while (newRoomCode.length < 5) {
        newRoomCode = "0" + newRoomCode;
      }
    } while (rooms.has(newRoomCode));

    console.log(`Creating room (${newRoomCode})`);
    const players = [];
    players.state = {
      started: false,
      timeStarted: null,
    };
    rooms.set(newRoomCode, players);

    socket.emit("acceptStartGameRequest", newRoomCode);
  });

  socket.on("requestJoinGame", (roomCode) => {
    if (!rooms.has(roomCode)) {
      socket.emit("unknownGameReject", roomCode);
      return;
    }
    const tempPlayers = rooms.get(roomCode);

    if (tempPlayers.length >= 8) {
      console.log(
        `User (${socket.id}) rejected from room (${roomCode}). Room Full`
      );
      socket.emit("fullGameReject");
    } else {
      socket.join(roomCode);
      player.roomCode = roomCode;
      tempPlayers.push(player);

      socket.emit("stateSet", tempPlayers.state, player);
      io.to(roomCode).emit("playerChange", tempPlayers);

      rooms.set(roomCode, tempPlayers);
    }
  });

  socket.on("joinGame", (username, roomCode) => {
    const sanitizedUsername = escape(username).trim();
    if (sanitizedUsername === "") {
      sanitizedUsername = "Dr. Noname";
    }
    player.username = sanitizedUsername;
    player.joined = true;

    if (!rooms.has(roomCode)) {
      socket.emit("unknownGameReject", roomCode);
      return;
    }

    const tempPlayers = rooms.get(roomCode);

    socket.emit("stateSet", tempPlayers.state, player);
    io.to(roomCode).emit("playerChange", tempPlayers);

    rooms.set(roomCode, tempPlayers);
    console.log(
      `User "${sanitizedUsername}" (${socket.id}) joined room (${roomCode})`
    );
  });

  socket.on("disconnect", () => {
    if (player.roomCode == "") {
      return;
    }

    socket.leave(player.roomCode);
    console.log(
      `User "${player.username}" (${socket.id}) disconnected from room (${player.roomCode})`
    );

    let tempPlayers = rooms.get(player.roomCode);
    const state = tempPlayers.state;

    tempPlayers = tempPlayers.filter(
      (players) => players.socketID != socket.id
    );
    tempPlayers.state = state;

    if (tempPlayers.length > 0) {
      io.to(player.roomCode).emit("playerChange", tempPlayers);
      rooms.set(player.roomCode, tempPlayers);
    } else {
      console.log(`Clearing Room (${player.roomCode})`);
      rooms.delete(player.roomCode);
    }
  });

  // Start a game:
  // 1. Set every player that isn't currently joining to playing
  // 2. Assign a random player as spy
  // 3. Assign a random location
  // 4. Assign every other player that isn't a spy a role
  socket.on("startStopGame", () => {
    if (!rooms.has(player.roomCode)) {
      return;
    }

    const tempPlayers = rooms.get(player.roomCode);
    if (tempPlayers.state.started) {
      tempPlayers.state.started = false;
      tempPlayers.state.timeStarted = null;

      io.to(player.roomCode).emit("stateChange", tempPlayers.state);
      io.to(player.roomCode).emit("assigmment", "Location", "Role");
    } else {
      const activePlayers = tempPlayers
        .filter((player) => player.joined)
        .map((player) => {
          player.playing = true;
          return player;
        });

      if (activePlayers.length == 0) return;

      tempPlayers.state.started = true;
      tempPlayers.state.timeStarted = Math.floor(Date.now() / 1000);

      io.to(player.roomCode).emit("stateChange", tempPlayers.state);

      const spyPlayer =
        activePlayers[Math.floor(Math.random() * activePlayers.length)];

      io.to(spyPlayer.socketID).emit("assigmment", "Spy", "<br>");

      const locationIndex = Math.floor(Math.random() * locations.length);
      const rolesClone = [...roles[locationIndex]];
      shuffleArray(rolesClone);

      activePlayers
        .filter((player) => player.socketID != spyPlayer.socketID)
        .forEach((player, idx) => {
          io.to(player.socketID).emit(
            "assigmment",
            locations[locationIndex],
            rolesClone[idx]
          );
        });

      io.to(player.roomCode).emit("playerChange", tempPlayers);
      rooms.set(player.roomCode, tempPlayers);
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(
    `SpyFall.Live server now running on ${server.address().address}:${port}`
  );
});
