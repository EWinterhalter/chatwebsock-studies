const socket = io();
let username = '';
let color = '#000000';

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.color-option').forEach(option => {
        option.onclick = function() {
            document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
            this.classList.add('selected');
            color = this.getAttribute('data-color');
        };
    });

    const chat = document.getElementById('chat');
    const messageInput = document.getElementById('message');
    const sendBtn = document.getElementById('sendBtn');
    const userList = document.getElementById('userList');

    function addMessage(content, color = '#000000', isSystem = false) {
        const msgDiv = document.createElement('div');
        msgDiv.style.color = color;
        msgDiv.textContent = content;
        chat.appendChild(msgDiv);
        chat.scrollTop = chat.scrollHeight;
    }

    function addUser(user) {
        const existingUser = Array.from(userList.children).find(div => div.textContent === user.username);
        if (existingUser) return; 
        const userDiv = document.createElement('div');
        userDiv.style.color = user.color;
        userDiv.textContent = user.username;
        userList.appendChild(userDiv);
    }
    
    socket.on('user_joined', (user) => {
        addUser(user);
    });

    function removeUser(username) {
        const userDivs = userList.querySelectorAll('div');
        userDivs.forEach(div => {
            if (div.textContent === username) {
                div.remove();
            }
        });
    }

    function updateUserList(users) {
        userList.innerHTML = '';
        const userListMessage = document.createElement('div');
        userListMessage.textContent = 'В чате присутствуют:';
        userList.appendChild(userListMessage);

        users.forEach(user => addUser(user));
    }

    socket.on('welcome', (users) => {
        addMessage('Добро пожаловать!', '#777', true);
        updateUserList(users);
    });

    socket.on('system_message', (msg) => {
        addMessage(msg, '#777', true);
        if (msg.includes('покинул чат')) {
            const username = msg.split(' ')[0];
            removeUser(username);
        }
    });

    socket.on('chat_message', (data) => {
        addMessage(`${data.username}: ${data.message}`, data.color);
    });

    

    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            socket.emit('chat_message', message);
            messageInput.value = '';
        }
    }

    sendBtn.onclick = sendMessage;
    messageInput.onkeydown = (event) => {
        if (event.key === 'Enter') sendMessage();
    };
});

function joinChat() {
    username = document.getElementById('usernameInput').value.trim();
    if (!username) {
        alert("Пожалуйста, введите имя.");
        return;
    }
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('chatContainer').style.display = 'flex';

    socket.emit('join', username, color);
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('joinBtn').onclick = joinChat;
});