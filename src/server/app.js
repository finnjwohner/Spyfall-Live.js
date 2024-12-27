import sanitizer from "sanitizer";
const { escape } = sanitizer;
import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import path from "path";
import { shuffleArray } from "./util.js";
import { locations } from "./locations_sv.js";
import { roles } from "./roles_sv.js";
import mobile from "is-mobile";

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
  let player = {
    socketID: socket.id,
    username: "Joining",
    roomCode: "",
    isMobile: mobile({ ua: socket.handshake.headers["user-agent"] }),
    disconnected: false,
    playing: false,
    joined: false,
    location: "Location",
    role: "Role",
  };

  const hideTab = () => {
    console.log(
      `User ${player.username} (${socket.id}) hid tab in room (${player.roomCode})`
    );
    player.disconnected = true;
    const players = rooms.get(player.roomCode);
    io.to(player.roomCode).emit("playerChange", stripPlayerData(players));
  };

  socket.on("hideTab", hideTab);

  socket.on("requestRejoin", (clientPlayerData) => {
    console.log(
      `User ${clientPlayerData.username} (${socket.id}) requested rejoin for room (${clientPlayerData.roomCode})`
    );
    if (clientPlayerData.socketID != player.socketID) {
      const filteredPlayers = rooms
        .get(clientPlayerData.roomCode)
        .filter((p) => p.socketID == clientPlayerData.socketID);

      if (!filteredPlayers.length) {
        return;
      }

      player = filteredPlayers[0];

      player.socketID = socket.id;
      socket.join(player.roomCode);
    }

    player.disconnected = false;
    const players = rooms.get(player.roomCode);
    socket.emit("stateSet", players.state, player);
    socket.emit("assignment", player.location, player.role);
    io.to(player.roomCode).emit("playerChange", stripPlayerData(players));
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
      io.to(roomCode).emit("playerChange", stripPlayerData(tempPlayers));

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
    io.to(roomCode).emit("playerChange", stripPlayerData(tempPlayers));

    rooms.set(roomCode, tempPlayers);
    console.log(
      `User "${sanitizedUsername}" (${socket.id}) joined room (${roomCode})`
    );
  });

  socket.on("disconnect", () => {
    if (player.roomCode == "") {
      return;
    }

    //socket.leave(player.roomCode);
    console.log(
      `User "${player.username}" (${socket.id}) disconnected from room (${player.roomCode})`
    );

    if (player.isMobile && !player.disconnected) {
      hideTab();
    }

    if (player.disconnected) {
      return;
    }

    let tempPlayers = rooms.get(player.roomCode);
    const state = tempPlayers.state;

    tempPlayers = tempPlayers.filter(
      (players) => players.socketID != socket.id
    );
    tempPlayers.state = state;

    if (tempPlayers.length > 0) {
      io.to(player.roomCode).emit("playerChange", stripPlayerData(tempPlayers));
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

      tempPlayers.forEach((player) => {
        io.to(player.socketID).emit("stateSet", tempPlayers.state, player);
      });
      io.to(player.roomCode).emit("assignment", "Location", "Role");
      tempPlayers.forEach((player) => {
        player.location = "Location";
        player.role = "Role";
      });
    } else {
      const activePlayers = [];
      tempPlayers.forEach((player) => {
        const isPlaying = player.joined && !player.disconnected;
        player.playing = isPlaying;
        if (isPlaying) activePlayers.push(player);
      });

      if (!activePlayers.length) return;

      tempPlayers.state.started = true;
      tempPlayers.state.timeStarted = Math.floor(Date.now() / 1000);

      tempPlayers.forEach((player) => {
        io.to(player.socketID).emit("stateSet", tempPlayers.state, player);
      });

      const spyPlayer =
        activePlayers[Math.floor(Math.random() * activePlayers.length)];

      spyPlayer.location = "Spy";
      spyPlayer.role = "<br>";
      io.to(spyPlayer.socketID).emit("assignment", "Spy", "<br>");

      const locationIndex = Math.floor(Math.random() * locations.length);
      const rolesClone = [...roles[locationIndex]];
      shuffleArray(rolesClone);

      activePlayers
        .filter((player) => player.socketID != spyPlayer.socketID)
        .forEach((player, idx) => {
          player.location = locations[locationIndex];
          player.role = rolesClone[idx];
          io.to(player.socketID).emit(
            "assignment",
            locations[locationIndex],
            rolesClone[idx]
          );
        });
      io.to(player.roomCode).emit("playerChange", stripPlayerData(tempPlayers));
      rooms.set(player.roomCode, tempPlayers);
    }
  });
});

const stripPlayerData = (players) => {
  const state = players.state ?? undefined;
  const strippedPlayers = players.map((player) => {
    return {
      username: player.username,
      disconnected: player.disconnected,
      socketID: player.socketID,
      playing: player.playing,
    };
  });

  strippedPlayers.state = state;
  return strippedPlayers;
};

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(
    `SpyFall.Live server now running on ${server.address().address}:${port}`
  );
});
