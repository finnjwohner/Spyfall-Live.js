const socket = io();

const startBtn = document.querySelector('#start-btn');
const joinBtn = document.querySelector('#join-btn');

startBtn.addEventListener('mousedown', () => {
    console.log('Sending request to web server to start a new game.')
    socket.emit('requestStartGame');
})

socket.on('acceptStartGameRequest', newRoomCode => {
    console.log(`Start game request accepted by the server, starting a new game at room code ${newRoomCode}`);
    window.location.replace(`./${newRoomCode}`);
})