const socket = io();
let localPlayer = undefined;

const joinSection = document.querySelector("section.join-form");
const joinBtn = document.querySelector("button#join-btn");
const nameInput = document.querySelector(".join-form input");
const validNameText = document.querySelector("p#valid-name-text");

const info = document.querySelectorAll(".info-container p");

const hideInfoBtn = document.querySelector("button#hide-info-btn");
const locationText = document.querySelector("h1#location");
const roleText = document.querySelector("h2#role");

const errorForm = document.querySelector("section.error-form");

const startBtn = document.querySelector("#start-btn");
const playersContainer = document.querySelector(".players");

const timer = document.querySelector("#timer");

let username = undefined;
let receivedErrorMsg = false;
let roomCode = "";
let strikedPlayers = [];

nameInput.focus();
nameInput.select();

const error = (errorMsg) => {
  joinSection.style.display = "none";
  errorForm.style.display = "flex";
  document.querySelector(".error-form h2").innerHTML = errorMsg;
};

error("Joining game, please wait.");

errorForm.addEventListener("mousedown", (e) => {
  if (e.target !== errorForm) {
    return;
  }

  window.location.replace("./");
});

try {
  roomCode = window.location.pathname.match(/[0-9]{5}/)[0];
  document.querySelector("#roomCode").innerHTML = "Room: " + roomCode;
  socket.emit("requestJoinGame", roomCode);
} catch (Exception) {
  error("There was an error finding the roomcode in the URL");
}

info.forEach((i) => {
  i.addEventListener("mousedown", () => {
    if (!i.striked) {
      i.style.textDecoration = "line-through";
      i.style.color = "var(--tertiaryTextColor)";
    } else {
      i.style.textDecoration = "none";
      i.style.color = "var(--textColor)";
    }

    i.striked = !i.striked;
  });
});

const unstrikeInfo = () => {
  info.forEach((i) => {
    i.striked = false;
    i.style.textDecoration = "none";
    i.style.color = "var(--textColor)";
  });
};

const strikePlayers = () => {
  players = document.querySelectorAll(".player");
  players.forEach((p) => {
    if (strikedPlayers.includes(p.id)) {
      p.style.textDecoration = "line-through";
      p.style.color = "var(--tertiaryTextColor)";
    } else if (!p.playing) {
      p.style.color = "var(--tertiaryTextColor)";
      p.style.fontStyle = "italic";
    } else {
      p.style.textDecoration = "none";
      p.style.color = "var(--textColor)";
    }

    p.addEventListener("mousedown", () => {
      if (!p.playing) {
        return;
      }

      if (strikedPlayers.includes(p.id)) {
        strikedPlayers = strikedPlayers.filter((id) => id != p.id);
        p.style.textDecoration = "none";
        p.style.color = "var(--textColor)";
      } else {
        strikedPlayers.push(p.id);
        p.style.textDecoration = "line-through";
        p.style.color = "var(--tertiaryTextColor)";
      }
    });
  });
};

hideInfoBtn.addEventListener("mousedown", () => {
  let displayStyle = "none";
  if (hideInfoBtn.infoHidden) {
    displayStyle = "block";
    hideInfoBtn.innerHTML = "Hide Location & Role";
  } else {
    hideInfoBtn.innerHTML = "Show Location & Role";
  }

  hideInfoBtn.infoHidden = !hideInfoBtn.infoHidden;
  locationText.style.display = displayStyle;
  roleText.style.display = displayStyle;
});

const enterGame = () => {
  if (nameInput.value.trim() == "") {
    validNameText.style.visibility = "visible";
  } else {
    username = nameInput.value;
    joinSection.style.display = "none";
    document.removeEventListener("keydown", handleKeyDown);
    joinBtn.removeEventListener("mousedown", enterGame);
    document.removeEventListener("keyup", handleKeyUp);
    socket.emit("joinGame", username, roomCode);
    document.addEventListener("keydown", (e) => {
      if (e.key === " ") {
        socket.emit("startStopGame");
      }
    });
  }
};

const handleKeyDown = (e) => {
  if (e.key === "Enter") {
    enterGame();
  }
};

const handleKeyUp = (e) => {
  if (e.key === "Escape") {
    window.location.replace("./");
  }
};

joinBtn.addEventListener("mousedown", enterGame);
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

socket.on("errorMsg", (msg) => {
  error(msg);
  receivedErrorMsg = true;
});

socket.on("disconnect", () => {
  if (receivedErrorMsg) return;

  if (localPlayer.disconnected)
    error(`Attempting to reconnect to room ${roomCode}`);
  else error("You have been disconnected from the game.");
});

socket.on("playerChange", (players) => {
  playersContainer.textContent = "";

  players.forEach((player) => {
    const playerBox = document.createElement("p");
    playerBox.classList.add("player");
    playerBox.innerHTML = player.username;
    if (player.disconnected)
      playerBox.innerHTML += ' <i class="fa-regular fa-eye-slash"></i>';
    if (player.leader)
      playerBox.innerHTML += ' <i class="fa-regular fa-chess-king"></i>';

    playerBox.id = player.socketID;

    playerBox.playing = player.playing;

    if (!player.playing) {
      playerBox.style.color = "var(--tertiaryTextColor)";
      playerBox.style.fontStyle = "italic";
    }

    if (localPlayer.leader) {
      const deleteButton = document.createElement("button");
      deleteButton.innerHTML = "&times;";

      if (!player.playing) {
        deleteButton.style.color = "var(--tertiaryTextColor)";
      }

      deleteButton.addEventListener("mousedown", () => {
        socket.emit("removePlayer", player.socketID);
      });

      playerBox.appendChild(deleteButton);
    }

    playersContainer.appendChild(playerBox);
  });

  for (i = 0; i < 8 - players.length; i++) {
    const playerBox = document.createElement("p");
    playerBox.classList.add("player");
    playersContainer.appendChild(playerBox);
  }

  strikePlayers();
});

let intervalID = undefined;
let currentTimeStarted = undefined;

const getTimerSecondsLeft = (timeStarted) =>
  900 - (Math.floor(Date.now() / 1000) - timeStarted);

const setTimerText = (timerSecondsLeft) => {
  timer.innerHTML = `${pad(Math.floor(timerSecondsLeft / 60), 2)}:${pad(
    timerSecondsLeft % 60,
    2
  )}`;
};

const setTimerInterval = (state) => {
  let timerSecondsLeft = getTimerSecondsLeft(state.timeStarted);
  setTimerText(timerSecondsLeft);

  if (intervalID) {
    clearInterval(intervalID);
  }

  intervalID = setInterval(() => {
    timerSecondsLeft = getTimerSecondsLeft(state.timeStarted);
    setTimerText(timerSecondsLeft);

    if (timerSecondsLeft <= 0) {
      clearInterval(intervalID);
      intervalID = undefined;
    }
  }, 1000);
};

socket.on("stateSet", (state, playerData) => {
  if (state.timeStarted != currentTimeStarted) {
    strikedPlayers = [];

    strikePlayers();
    unstrikeInfo();
  }

  localPlayer = playerData;
  currentTimeStarted = state.timeStarted;

  if (state.started) {
    startBtn.innerHTML = "Stop";
    setTimerInterval(state);
  } else {
    startBtn.innerHTML = "Start";
    setTimerText(900);

    if (intervalID) clearInterval(intervalID);
  }
});

const pad = (num, size) => {
  return ("00000" + num).substr(-size);
};

startBtn.addEventListener("mousedown", () => {
  socket.emit("startStopGame");
});

socket.on("assignment", (location, role) => {
  locationText.innerHTML = location;
  roleText.innerHTML = role;
});

socket.on("connect", () => {
  joinSection.style.display = username ? "none" : null;
  errorForm.style.display = "none";
  document.querySelector(".error-form h2").innerHTML = "";

  if (localPlayer && localPlayer.disconnected) {
    socket.emit("requestRejoin", localPlayer);
  }
});

document.addEventListener("visibilitychange", () => {
  if (!localPlayer.isMobile ?? true) return;

  if (document.hidden) {
    socket.emit("hideTab");
    localPlayer.disconnected = true;
  } else {
    if (socket.connected) {
      socket.emit("requestRejoin", localPlayer);
    }
  }
});
