const socket = io();

const info = document.querySelectorAll('.info-container p');
info.forEach(i => {
    i.addEventListener('mousedown', () => {
        if (!i.striked) {
            i.style.textDecoration ='line-through';
            i.style.color = '#dcdcdc';
        } else {
            i.style.textDecoration ='none';
            i.style.color = '#000';
        }

        i.striked = !i.striked;
    });
});

let leader = '';
let strikedPlayers = [];
const strikePlayers = () => {
    players = document.querySelectorAll('.player');
    players.forEach(p => {
        if(strikedPlayers.includes(p.id)) {
            p.style.textDecoration ='line-through';
            p.style.color = '#dcdcdc';
        } else if(!p.playing) {
            p.style.color = '#dcdcdc';
            p.style.fontStyle = 'italic';
        } else {
            p.style.textDecoration ='none';
            p.style.color = '#000';
        }

        if (leader != '' && leader == p.id) {
            console.log('adding leader');
            p.classList.add('leader');
        }

        p.addEventListener('mousedown', () => {
            if(!p.playing) { return; }

            if (strikedPlayers.includes(p.id)) {
                strikedPlayers = strikedPlayers.filter(id => id != p.id);
                p.style.textDecoration ='none';
                p.style.color = '#000';
            } else {
                strikedPlayers.push(p.id);
                p.style.textDecoration ='line-through';
                p.style.color = '#dcdcdc';
            }
        });
    });
}

const hideInfoBtn = document.querySelector('button#hide-info-btn');
const locationText = document.querySelector('h1#location');
const roleText = document.querySelector('h2#role');
hideInfoBtn.addEventListener('mousedown', () => {
    let displayStyle = 'none';
    if (hideInfoBtn.infoHidden) {
        displayStyle = 'block';
        hideInfoBtn.innerHTML = 'Hide Location & Role';
    } else {
        hideInfoBtn.innerHTML = 'Show Location & Role';
    }

    hideInfoBtn.infoHidden = !hideInfoBtn.infoHidden;
    locationText.style.display = displayStyle;
    roleText.style.display = displayStyle;
});

const joinSection = document.querySelector('section.join-form');
const joinBtn = document.querySelector('button#join-btn');
const nameInput = document.querySelector('.join-form input');
const validNameText = document.querySelector('p#valid-name-text');
let username = '';
const errorForm = document.querySelector('section.error-form');

const error = errorMsg => {
    joinSection.style.display = 'none';
    errorForm.style.display = 'flex';
    document.querySelector('.error-form h2').innerHTML = errorMsg;
}

try {
    const roomCode = window.location.pathname.match(/[0-9]{5}/)[0];
    document.querySelector('#roomCode').innerHTML = 'Room: ' + roomCode;
    socket.emit('requestJoinGame', roomCode);
    joinBtn.addEventListener('mousedown', () => {
        if (nameInput.value == '') {
            validNameText.style.visibility = 'visible';
        } else {
            username = nameInput.value;
            joinSection.style.display = 'none';
            socket.emit('joinGame', username, roomCode);
        }
    })
} catch(Exception) {
    error('There was an error finding the roomcode in the URL');
}

socket.on('fullGameReject', () => {
    error('Error joining the game, the game was full')
})

socket.on('unknownGameReject', roomCode => {
    error(`No game could be found with the room code ${roomCode}`);
})

const startBtn = document.querySelector('#start-btn');
const playersContainer = document.querySelector('.players');
socket.on('playerChange', players => {
    playersContainer.textContent = '';

    players.forEach(player => {
        const playerBox = document.createElement("p");
        playerBox.classList.add("player");
        playerBox.innerHTML = player.username;
        playerBox.id = player.socketID;
        playerBox.playing = player.playing;
        if (!player.playing) {
            playerBox.style.color = '#dcdcdc';
            playerBox.style.fontStyle = 'italic';
        }
        playersContainer.appendChild(playerBox);
    })

    for(i = 0; i < (8 - players.length); i++) {
        const playerBox = document.createElement("p");
        playerBox.classList.add("player");
        playersContainer.appendChild(playerBox);
    }

    strikePlayers();
});

socket.on('stateSet', state => {
    if (state) {
        startBtn.innerHTML = 'Stop';
    } else {
        startBtn.innerHTML = 'Start';
    }
})

const pad = (num, size) => {return ('00000' + num).substr(-size); }

const timer = document.querySelector('#timer');
let timerSecondsLeft = 900;
let intervalID = '';
socket.on('stateChange', (state, leaderID) => {
    if (state) {
        leader = leaderID;
        strikePlayers();

        startBtn.innerHTML = 'Stop';
        timerSecondsLeft = 900;

        intervalID = setInterval(() => {
            timerSecondsLeft -= 1;
            timer.innerHTML = `${pad(Math.floor(timerSecondsLeft / 60),2)}:${pad(timerSecondsLeft % 60,2)}`;

            if (timerSecondsLeft <= 0) {
                clearInterval(intervalID);
            }
        }, 1000);
    } else {
        startBtn.innerHTML = 'Start';
        timerSecondsLeft = 900;
        timer.innerHTML = `${pad(Math.floor(timerSecondsLeft / 60),2)}:${pad(timerSecondsLeft % 60,2)}`;

        if (intervalID != '') {
            clearInterval(intervalID);
        }
    }
})

startBtn.addEventListener('mousedown', () => {
    socket.emit('startStopGame');
})

socket.on('assigmment', (location, role) => {
    locationText.innerHTML = location;
    roleText.innerHTML = role;
});