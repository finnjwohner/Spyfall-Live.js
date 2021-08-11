const menu = document.querySelector('.menu');
const startBtn = document.querySelector('#startBtn');
const joinBtn = document.querySelector('#joinBtn');

const joinForm = document.querySelector('.joinForm');
const joinRoomCode = document.querySelector('.join-roomCode');
const joinName = document.querySelector('.join-name');
const joinNextBtn = document.querySelector('.join-nextBtn');
const joinRoomInput = document.querySelector('#join-roomInput');
const joinNameInput = document.querySelector('#join-nameInput');

const startForm = document.querySelector('.startForm');
const startNameInput = document.querySelector('#start-nameInput');

const backBtns = document.querySelectorAll('.backBtn');
backBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        menu.style.display = 'block';
        joinForm.style.display = 'none';
        startForm.style.display = 'none';

        joinRoomCode.style.display = 'block';
        joinName.style.display = 'none';

        joinRoomInput.value = '';
        joinNameInput.value = '';
        startNameInput.value = '';
    })
});

joinBtn.addEventListener('click', () => {
    menu.style.display = 'none';
    joinForm.style.display = 'block';
})

startBtn.addEventListener('click', () => {
    menu.style.display = 'none';
    startForm.style.display = 'block';
});

joinNextBtn.addEventListener('click', () => {
    if (joinRoomInput.value != '') {
        joinRoomCode.style.display = 'none';
        joinName.style.display = 'block';
    }
})

window.addEventListener('keyup', () => {
    setTimeout(() => {
        if (joinNameInput.value != '')
        window.name = joinNameInput.value;
    else
        window.name = startNameInput.value;
    }, 0);
})