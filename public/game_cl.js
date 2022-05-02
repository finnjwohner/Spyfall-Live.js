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

const playersContainer = document.querySelector('.players');
socket.on('playerChange', players => {
    playersContainer.textContent = '';

    players.forEach(player => {
        const playerBox = document.createElement("p");
        playerBox.classList.add("player");
        playerBox.innerHTML = player.username;
        playersContainer.appendChild(playerBox);
    })

    for(i = 0; i < (8 - players.length); i++) {
        const playerBox = document.createElement("p");
        playerBox.classList.add("player");
        playersContainer.appendChild(playerBox);
    }
});