var express = require('express');
var _ = require('lodash');
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
var scores = {
    blue: 0,
    red: 0
};

var PERK_TYPE = {
    STAR: 'star',
    SHOE: 'shoe',
    CLOCK: 'clock',
    NO_PAINT: 'no-paint'
}

const GAME_LENGTH = 30000

function drawNewPerk() {
    const perkTypes = Object.values(PERK_TYPE);
    const randomPerkType = _.sample(perkTypes);

    return {
        x: Math.floor(Math.random() * GAME_WIDTH),
        y: Math.floor(Math.random() * GAME_HEIGHT),
        type: randomPerkType
    }
}

var perk = drawNewPerk();
var gameStatus = 'waiting';

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

const checkGameCanBeStarted = () => {
    const p = Object.values(players);
    return gameStatus !== 'started' && p.filter((p) => !p.ready).length === 0 && p.length > 1;
}

const changeGameStatus = (status) => {
    gameStatus = status
    io.emit('gameStatusChanged', status);
}

const stopGame = () => {
    changeGameStatus('finished')
}

const tryToStartGame = () => {
    if (checkGameCanBeStarted()) {
        changeGameStatus('started')
        setTimeout(() => {
            stopGame();
        }, GAME_LENGTH)
    }
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

    // when a player moves, update the player data
    socket.on('playerReady', function () {
        players[socket.id].ready = true;
        setTimeout(() => {
            tryToStartGame();
        }, 2000)
    });
    // send the star object to the new player
    socket.emit('perkDrop', perk);
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
        if (Object.values(players).length <= 1) {
            stopGame();
        }
    });

    // when a player moves, update the player data
    socket.on('playerMovement', function (movementData) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].rotation = movementData.rotation;
        // emit a message to all players about the player that moved
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });

    socket.on('perkCollected', function (perkType) {
        // draw new random perk in random position
        perk = drawNewPerk();

        handlePerk(perkType);

        // notify about new perk drop
        io.emit('perkDrop', perk);

        // update scores
        io.emit('scoreUpdate', scores);
    });


    function handlePerk(perkType) {
        switch (perkType) {
            case PERK_TYPE.STAR:
                handleStarCollection()
                break;
            case PERK_TYPE.SHOE:
                handleShoeCollection();
                break;
            case PERK_TYPE.CLOCK:
                handleClockCollection();
                break;
            case PERK_TYPE.NO_PAINT:
                handleNoPaintCollection();
                break;
        }
    }

    function handleStarCollection() {
        // notify that big brush has been activated
        io.emit('bigBrushActivated', players[socket.id].playerId);

        // notify that big brush has been deactivated
        setTimeout(() => {
            io.emit('bigBrushDeactivated', players[socket.id].playerId);
        }, 1000);
    }

    function handleShoeCollection() {
        // notify that big brush has been activated
        io.emit('shoeActivated', players[socket.id].playerId);

        // notify that big brush has been deactivated
        setTimeout(() => {
            io.emit('shoeDeactivated', players[socket.id].playerId);
        }, 2000);
    }

    function handleClockCollection() {
        // notify that big brush has been activated
        io.emit('clockActivated', players[socket.id].playerId);

        // notify that big brush has been deactivated
        setTimeout(() => {
            io.emit('clockDeactivated', players[socket.id].playerId);
        }, 1500);
    }

    function handleNoPaintCollection() {
        // notify that big brush has been activated
        io.emit('noPaintActivated', players[socket.id].playerId);

        // notify that big brush has been deactivated
        setTimeout(() => {
            io.emit('noPaintDeactivated', players[socket.id].playerId);
        }, 1200);
    }
});

server.listen(8081, function () {
    console.log(`Listening on ${server.address().port}`);
});
