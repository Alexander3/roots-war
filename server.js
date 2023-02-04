var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
    }
});

const colors = [
    'red',
    'blue',
    'green',
    'pink'
]

var GAME_WIDTH = 1920;
var GAME_HEIGHT = 1080;

var players = {};
var star = {
    x: Math.floor(Math.random() * GAME_WIDTH),
    y: Math.floor(Math.random() * GAME_HEIGHT)
};
var scores = {
    blue: 0,
    red: 0
};

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

const getRandomTeam = () => {
    const id = (Math.floor(Math.random() * colors.length));
    return colors[id]
}

const getTeam = () => {
    const team = getRandomTeam();
    const exists = Object.values(players).find((t) => t.team === team)
    if (exists) {
        return getTeam();
    }
    return team;
}

io.on('connection', function (socket) {
    const team = getTeam();
    console.log('a user connected: ', socket.id, team);
    // create a new player and add it to our players object
    players[socket.id] = {
        rotation: 0,
        x: Math.floor(Math.random() * GAME_WIDTH),
        y: Math.floor(Math.random() * GAME_HEIGHT),
        playerId: socket.id,
        team
    };
    // send the players object to the new player
    socket.emit('currentPlayers', players);
    // send the star object to the new player
    socket.emit('starLocation', star);
    // send the current scores
    socket.emit('scoreUpdate', scores);
    // update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // when a player disconnects, remove them from our players object
    socket.on('disconnect', function () {
        console.log('user disconnected: ', socket.id);
        delete players[socket.id];
        // emit a message to all players to remove this player
        socket.disconnect(socket.id);
    });

    // when a player moves, update the player data
    socket.on('playerMovement', function (movementData) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].rotation = movementData.rotation;
        // emit a message to all players about the player that moved
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });

    socket.on('starCollected', function () {
        if (players[socket.id].team === 'red') {
            scores.red += 10;
        } else {
            scores.blue += 10;
        }

        star.x = Math.floor(Math.random() * GAME_WIDTH);
        star.y = Math.floor(Math.random() * GAME_HEIGHT);

        // notify that big brush has been activated
        io.emit('bigBrushActivated', players[socket.id].playerId);

        // notify that big brush has been deactivated
        setTimeout(() => {
            io.emit('bigBrushDeactivated', players[socket.id].playerId);
        }, 1000)

        io.emit('starLocation', star);
        io.emit('scoreUpdate', scores);
    });
});

server.listen(8081, function () {
    console.log(`Listening on ${server.address().port}`);
});
