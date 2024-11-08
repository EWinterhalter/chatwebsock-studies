const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = {};

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
    console.log('Новое подключение: ' + socket.id);

    socket.on('join', (username, color) => {
        users[socket.id] = { username, color };
        socket.username = username;
        socket.color = color;

        const userList = Object.values(users).map(user => ({ username: user.username, color: user.color }));
        socket.emit('welcome', userList); 
        io.emit('user_joined', { username, color }); 
        io.emit('system_message', `${username} присоединился к чату.`);
    });

    socket.on('chat_message', (message) => {
        io.emit('chat_message', { username: socket.username, message, color: socket.color });
    });

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            const username = users[socket.id].username;
            delete users[socket.id];
            const userList = Object.values(users).map(user => ({ username: user.username, color: user.color }));
            io.emit('welcome', userList);
            io.emit('system_message', `${username} покинул чат.`);
        }
    });
});

server.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000');
});
