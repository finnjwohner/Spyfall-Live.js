const socket = io();

const startBtn = document.querySelector('#start-btn');
const joinBtn = document.querySelector('#join-btn');
const validCodeText = document.querySelector('#valid-code-text');
const codeJoinBtn = document.querySelector('#code-join-btn');
const codeInput = document.querySelector('section .form input');
const codeJoinForm = document.querySelector('section.code-join-form');
const codeJoinFormBackBtn = document.querySelector('section.code-join-form a');

startBtn.addEventListener('mousedown', () => {
    console.log('Sending request to web server to start a new game.')
    socket.emit('requestStartGame');
})

socket.on('acceptStartGameRequest', newRoomCode => {
    console.log(`Start game request accepted by the server, starting a new game at room code ${newRoomCode}`);
    window.location.replace(`./${newRoomCode}`);
})

codeJoinForm.style.display = 'none';
joinBtn.addEventListener('mousedown', () => {
    codeJoinForm.style.display = 'flex';
    codeInput.focus();
    codeInput.select();
});

codeJoinFormBackBtn.addEventListener('mousedown', () => {
    codeJoinForm.style.display = 'none';
});

codeJoinForm.addEventListener('mousedown', e => {
    if (e.target !== codeJoinForm) { return; }
    codeJoinForm.style.display = 'none';
})

const enterCode = () => {
    code = codeInput.value.trim();
    if (code.length == 5) {
        window.location.replace(`./${codeInput.value}`);
    } else {
        validCodeText.style.visibility = 'visible';
    }
}

codeJoinBtn.addEventListener('mousedown', enterCode);

document.addEventListener('keyup', e => {
    if (e.key === 'Escape') {
        codeJoinForm.style.display = 'none';
    }
})

document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && codeJoinForm.style.display == 'flex')  {
        enterCode();
    }
})