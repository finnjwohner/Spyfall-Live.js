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
import sanitize from "sanitize";
import { MongoClient } from "mongodb";

const __dirname = import.meta.dirname;
const app = express();
const server = createServer(app);
const io = new Server(server);

const APP_CONFIG = JSON.parse(process.env.APP_CONFIG);
const MONGO_PW = process.env.MONGO_PW;
const MONGO_URL = `mongodb://${APP_CONFIG.mongo.user}:${encodeURIComponent(
  MONGO_PW
)}@${APP_CONFIG.mongo.hostString}`;

const mongoClient = new MongoClient(MONGO_URL);

// Initialise the rooms
const rooms = new Map();

const disconnectedPlayerTimeoutIDs = new Map();

// Set directory for public static files
app.use(express.static(path.join(__dirname, "../public")));
app.use(sanitize.middleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/index", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/lander", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/robots.txt", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/robots.txt"));
});

app.get("/rules", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/rules.html"));
});

app.get("/suggestions", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/suggestions.html"));
});

app.get("/sitemap", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/sitemap.xml"));
});

app.get("/:roomCode", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/room.html"));
});

app.post("/suggestions", async (req, res) => {
  console.log("Receiving New Suggestion/Bug Report");

  const validReportTypes = ["bug", "suggestion"];

  if (
    !validReportTypes.includes(req.body.reportType) ||
    req.body.report.length === 0
  ) {
    res.status(400).send();
    return;
  }

  try {
    await mongoClient.connect();
    console.log("MongoDB Connection Secured");

    const db = mongoClient.db(APP_CONFIG.mongo.db);
    const reports = db.collection("reports");

    const result = await reports.insertOne(req.body);
    console.log(
      `A document was inserted into reports with the _id: ${result.insertedId}`
    );
    res.status(201).send();
  } catch (e) {
    res.status(500).send();
    console.error(e);
  } finally {
    console.log("Closing MongoDB Connection");
    mongoClient.close();
  }
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
    leader: false,
    location: "Location",
    role: "Role",
  };

  const hideTab = () => {
    player.disconnected = true;
    const players = rooms.get(player.roomCode);
    io.to(player.roomCode).emit("playerChange", stripPlayerData(players));
  };

  socket.on("hideTab", hideTab);

  socket.on("requestRejoin", (clientPlayerData) => {
    if (!rooms.has(clientPlayerData.roomCode)) {
      socket.emit(
        "errorMsg",
        `No room exists with the room code ${clientPlayerData.roomCode}.`
      );
      io.in(socket.id).disconnectSockets();
      return;
    }

    const players = rooms.get(clientPlayerData.roomCode);

    if (players.removedPlayers.has(clientPlayerData.socketID)) {
      socket.emit("errorMsg", `You have been removed from this room.`);
      io.in(socket.id).disconnectSockets();
      return;
    }

    console.log(
      `User ${clientPlayerData.username} (${socket.id}) requested rejoin for room (${clientPlayerData.roomCode})`
    );

    if (clientPlayerData.socketID != player.socketID) {
      const filteredPlayers = rooms
        .get(clientPlayerData.roomCode)
        .filter((p) => p.socketID == clientPlayerData.socketID);

      if (!filteredPlayers.length) {
        socket.emit("errorMsg", `Error. Could not reconnect you to this room.`);
        io.in(socket.id).disconnectSockets();
        return;
      }

      player = filteredPlayers[0];

      player.socketID = socket.id;
      socket.join(player.roomCode);
    }

    player.disconnected = false;
    socket.emit("stateSet", players.state, player);
    socket.emit("assignment", player.location, player.role);
    io.to(player.roomCode).emit("playerChange", stripPlayerData(players));

    if (disconnectedPlayerTimeoutIDs.has(clientPlayerData.socketID)) {
      console.log(
        `Clearing disconnect timer (${clientPlayerData.socketID}) for user "${player.username}" (${socket.id}) in room (${player.roomCode})`
      );
      clearTimeout(disconnectedPlayerTimeoutIDs.get(clientPlayerData.socketID));
      disconnectedPlayerTimeoutIDs.delete(clientPlayerData.socketID);
    }
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
    players.removedPlayers = new Set();
    rooms.set(newRoomCode, players);

    socket.emit("acceptStartGameRequest", newRoomCode);
  });

  socket.on("requestJoinGame", (roomCode) => {
    if (!rooms.has(roomCode)) {
      socket.emit("errorMsg", `No room exists with the room code ${roomCode}`);
      io.in(socket.id).disconnectSockets();
      return;
    }
    const tempPlayers = rooms.get(roomCode);

    if (!tempPlayers.length) {
      player.leader = true;
    }

    if (tempPlayers.length >= 8) {
      console.log(
        `User (${socket.id}) rejected from room (${roomCode}). Room Full`
      );
      socket.emit("errorMsg", "This room is already full.");
      io.in(socket.id).disconnectSockets();
    } else {
      socket.join(roomCode);
      player.roomCode = roomCode;
      tempPlayers.push(player);

      socket.emit("stateSet", tempPlayers.state, player);
      io.to(roomCode).emit("playerChange", stripPlayerData(tempPlayers));
    }
  });

  socket.on("removePlayer", (removedPlayerSocketID) => {
    if (!player.leader) return;

    console.log(
      `User "${player.username}" (${socket.id}) removed player (${removedPlayerSocketID})"`
    );

    if (rooms.has(player.roomCode)) {
      const players = rooms.get(player.roomCode);
      players.removedPlayers.add(removedPlayerSocketID);
    }

    disconnectPlayer(removedPlayerSocketID, player.roomCode);
  });

  socket.on("joinGame", (username, roomCode) => {
    const sanitizedUsername = escape(username).trim();
    if (sanitizedUsername === "") {
      sanitizedUsername = "Dr. Noname";
    }
    player.username = sanitizedUsername;
    player.joined = true;

    if (!rooms.has(roomCode)) {
      socket.emit("errorMsg", `No room exists with the room code ${roomCode}`);
      io.in(socket.id).disconnectSockets();
      return;
    }

    const tempPlayers = rooms.get(roomCode);

    socket.emit("stateSet", tempPlayers.state, player);
    io.to(roomCode).emit("playerChange", stripPlayerData(tempPlayers));

    console.log(
      `User "${sanitizedUsername}" (${socket.id}) joined room (${roomCode})`
    );
  });

  socket.on("disconnect", () => {
    if (!player.roomCode) return;

    if (player.isMobile && !player.disconnected) {
      hideTab();
    }

    if (player.disconnected) {
      const timeoutID = setTimeout(
        () => disconnectPlayer(socket.id, player.roomCode),
        20 * 60 * 1000
      );
      disconnectedPlayerTimeoutIDs.set(socket.id, timeoutID);
      console.log(
        `Set disconnect timer (${socket.id}) for user "${player.username}" (${socket.id}) in room (${player.roomCode})`
      );

      if (player.leader) selectNewLeader(socket.id, player.roomCode);
    } else {
      disconnectPlayer(socket.id, player.roomCode);
    }
  });

  const disconnectPlayer = (socketID, roomCode) => {
    if (!rooms.has(roomCode)) return;
    let players = rooms.get(roomCode);

    const removedPlayer = players.find((p) => p.socketID === socketID);
    if (!removedPlayer) return;

    io.in(socketID).socketsLeave(roomCode);
    io.in(socketID).disconnectSockets();

    console.log(
      `User "${removedPlayer.username}" (${socketID}) disconnected from room (${roomCode})`
    );

    const state = players.state;
    const removedPlayers = players.removedPlayers;

    players = players.filter((p) => p.socketID != socketID);

    players.state = state;
    players.removedPlayers = removedPlayers;

    if (players.length > 0) {
      if (removedPlayer.leader) {
        selectNewLeader(removedPlayer.socketID, roomCode);
      }

      io.to(roomCode).emit("playerChange", stripPlayerData(players));
      rooms.set(roomCode, players);
    } else {
      console.log(`Clearing Room (${roomCode})`);
      rooms.delete(roomCode);
    }
  };

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
    }
  });
});

const selectNewLeader = (currentLeaderSocketID, roomCode) => {
  if (!rooms.has(roomCode)) return;

  const players = rooms.get(roomCode);

  if (players.length <= 1) return;

  let leaderPlayer = undefined;
  let newLeaderPlayer = undefined;
  let foundNewLeader = false;

  for (let i = 0; i < players.length; i++) {
    if (players[i].socketID === currentLeaderSocketID) {
      leaderPlayer = players[i];
      continue;
    }

    if (!players[i].disconnected) {
      players[i].leader = true;
      newLeaderPlayer = players[i];
      foundNewLeader = true;
      break;
    }
  }

  if (!foundNewLeader) {
    for (let i = 0; i < players.length; i++) {
      if (players[i].socketID === currentLeaderSocketID) continue;

      players[i].leader = true;
      newLeaderPlayer = players[i];
      foundNewLeader = true;
      break;
    }
  }

  leaderPlayer.leader = false;
  io.to(newLeaderPlayer.socketID).emit(
    "stateSet",
    players.state,
    newLeaderPlayer
  );
};

const stripPlayerData = (players) => {
  if (!players) return;

  const state = players.state ?? undefined;

  const strippedPlayers = players.map((player) => {
    return {
      username: player.username,
      disconnected: player.disconnected,
      socketID: player.socketID,
      playing: player.playing,
      leader: player.leader,
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
