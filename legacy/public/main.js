const socket = io();

const timerP = document.querySelector('#timer');

users = [];
timer = 900;
intervalId = '';

locHidden = false;
const hideBtn = document.querySelector('.hideBtn');
const locDiv = document.querySelector('.location');
hideBtn.addEventListener('click', () => {
    locHidden = !locHidden;
    if (locHidden) {
        hideBtn.innerHTML = 'Show Location & Role';
        locDiv.style.display = 'none';
        hideBtn.style.marginBottom = '1rem';
    }
    else {
        hideBtn.innerHTML = 'Hide Location & Role';
        locDiv.style.display = 'block';
        hideBtn.style.marginBottom = 'auto';
    }
})

const locationsDiv = document.querySelector('.locations');
const updateLocations = locs => {
    for (i = 0; i < locs.length; i++) {
        locationsDiv.children[i].innerHTML = locs[i];
        locationsDiv.children[i].classList.remove('crossed');
    }
}

const playerCount = document.querySelector('#playerCount');
const roomCode = document.querySelector('#roomCode');
const updateInfoBar = () => {
    roomCode.innerHTML = users[0].room;
    playerCount.innerHTML = `${users.length}/8`;
    updatePlayers(users);
}

const playersDiv = document.querySelector('div.players');
const updatePlayers = users => {
    for(i = 0; i < playersDiv.children.length; i++) {
        playersDiv.children[i].innerHTML = '';
        playersDiv.classList.remove('occupied');
        playersDiv.classList.remove('crossed');
    }

    for(i = 0; i < users.length; i++) {
        playersDiv.children[i].innerHTML = users[i].username;
        playersDiv.children[i].classList.add('occupied');
        if (users[i].crossed)
            playersDiv.children[i].classList.add('crossed');
    }
}

playersDiv.childNodes.forEach(child => {
    child.addEventListener('click', () => {
        users.forEach(user => {
            if (user.username == child.innerHTML) {
                if (user.crossed == undefined || !user.crossed) {
                    user.crossed = true;
                    child.classList.add('crossed');
                }
                else {
                    user.crossed = false;
                    child.classList.remove('crossed');
                }
            }
        })
    });
});

socket.on('joinRoomFull', () => {
    alert("The game you're trying to join is full, starting a new room instead.");
})

locationsDiv.childNodes.forEach(child => {
    child.addEventListener('click', () => {
        if (child.classList.contains('crossed'))
            child.classList.remove('crossed');
        else
            child.classList.add('crossed');
    })
})

// Get room code
const code = Qs.parse(location.search, {
    ignoreQueryPrefix: true
}).room;

let user = {
    id: undefined,
    username: window.name,
    room: code,
};

socket.emit('joinRoom', user);

socket.on('joinRoomAccept', (usersdata, locs) => {
    users = usersdata;
    updateInfoBar();
    updateLocations(locs);
});

socket.on('joinedRoom', user => {
    users.push(user);
    updateInfoBar();
});

socket.on('leftRoom', user => {
    for(i = 0; i < users.length; i++) {
        if (users[i].id == user.id) {
            users[i].crossed = false;
            playersDiv.children[i].classList.remove('crossed');
            users.splice(i, 1);
        }
    }
    updateInfoBar();
})

const startBtn = document.querySelector('b#startBtn');
const stopBtn = document.querySelector('b#stopBtn');
startBtn.addEventListener('click', () => {
    if (startBtn.classList.contains('btn')) {
        socket.emit('startGame');
        startBtn.classList.remove('btn');
        startBtn.innerHTML = 'Started';
        stopBtn.innerHTML = 'Stop';
        stopBtn.classList.add('btn');
    }
})

stopBtn.addEventListener('click', () => {
    if (stopBtn.classList.contains('btn')) {
        socket.emit('stopGame');
        stopBtn.classList.remove('btn');
        stopBtn.innerHTML = 'Stopped';
        startBtn.innerHTML = 'Start';
        startBtn.classList.add('btn');
    }
})

socket.on('stoppedGame', () => {
    startBtn.classList.add('btn');
    startBtn.innerHTML = 'Start';
    stopBtn.classList.remove('btn');
    stopBtn.innerHTML = 'Stopped';
    clearInterval(intervalId);
    timerP.innerHTML = '15:00';
    document.querySelector('.location h1').innerHTML = 'Location';
    document.querySelector('.location h2').innerHTML = 'Role';
})

socket.on('getLocation', (locs, location, role) => {
    clearInterval(intervalId);
    timer = 900;
    startBtn.classList.remove('btn');
    startBtn.innerHTML = 'Started';
    stopBtn.classList.add('btn');
    stopBtn.innerHTML = 'Stop';
    updateLocations(locs);
    document.querySelector('.location h1').innerHTML = location;
    document.querySelector('.location h2').innerHTML = role;

    intervalId = setInterval(() => {
        if (timer > 0)
            timer--;
        else {
            clearInterval(intervalId);
        }
        mins = ((timer % 3600) / 60) - ((timer % 3600) / 60) % 1;
        secs = timer % 60;
        if (secs < 10)
            secs = `0${secs}`;
        timerP.innerHTML = `${mins}:${secs}`;
    }, 1000);
})