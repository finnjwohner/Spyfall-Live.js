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

codeJoinForm = document.querySelector('section.code-join-form');
codeJoinForm.style.display = 'none';
joinBtn.addEventListener('mousedown', () => {
    codeJoinForm.style.display = 'flex';
});

const codeJoinFormBackBtn = document.querySelector('section.code-join-form a');
codeJoinFormBackBtn.addEventListener('mousedown', () => {
    codeJoinForm.style.display = 'none';
});

const codeJoinBtn = document.querySelector('#code-join-btn');
const codeInput = document.querySelector('section .form input');
codeJoinBtn.addEventListener('mousedown', () => {
    window.location.replace(`./${codeInput.value}`);
});