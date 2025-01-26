import { create } from "domain";

const sep = " | ";

const roomPrefix = (roomCode) => {
  return `Room ${roomCode ?? "UNKNOWN"}`.padEnd(12);
};

const playerPrefix = (player) => {
  return `"${player.username ?? "UNKNOWN"}" (${player.socketID})`.padEnd(41);
};

const createRoom = (roomCode) => {
  console.log((roomPrefix(roomCode) + sep).padEnd(56) + sep + "Created");
};

const joined = (player) => {
  console.log(
    roomPrefix(player.roomCode) + sep + playerPrefix(player) + sep + "Joined"
  );
};

const disconnectTimer = (player) => {
  console.log(
    roomPrefix(player.roomCode) +
      sep +
      playerPrefix(player) +
      sep +
      "Disconnect Timer Set"
  );
};

const clearDisconnectTimer = (player) => {
  console.log(
    roomPrefix(player.roomCode) +
      sep +
      playerPrefix(player) +
      sep +
      "Disconnect Timer Cleared"
  );
};

const disconnected = (player) => {
  console.log(
    roomPrefix(player.roomCode) +
      sep +
      playerPrefix(player) +
      sep +
      "Disconnected"
  );
};

const clearRoom = (room) => {
  const duration = Date.now() - room.state.roomCreationTime;
  const durationString = new Date(duration).toISOString().slice(11, 19);
  console.log(
    roomPrefix(room.state.code) +
      sep +
      `Existed For ${durationString}`.padEnd(41) +
      sep +
      "Cleared"
  );
};

const roomFull = (socketID, roomCode) => {
  console.log(
    roomPrefix(roomCode) +
      sep +
      playerPrefix({ username: null, socketID: socketID }) +
      sep +
      "Rejected, Full Room"
  );
};

const rejoin = (player) => {
  console.log(
    roomPrefix(player.roomCode) +
      sep +
      playerPrefix(player) +
      sep +
      "Requests Rejoin"
  );
};

const removedPlayer = (player1, player2) => {
  console.log(
    roomPrefix(player1.roomCode) +
      sep +
      playerPrefix(player1) +
      sep +
      "Removed Player " +
      playerPrefix(player2)
  );
};

export default {
  joined,
  disconnectTimer,
  disconnected,
  clearRoom,
  rejoin,
  clearDisconnectTimer,
  createRoom,
  roomFull,
  removedPlayer,
};
