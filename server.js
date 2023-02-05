var express = require('express');
var _ = require('lodash');
var app = express();
var server = require('http').Server(app);
var {names, adjectives} = require('./src/data/names');
var io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
require('dotenv').config()

const teamNames = ["white", "green", "orange", "pink", "red", "grey"];
let endTime
let gameTimeout

var GAME_WIDTH = 1920;
var GAME_HEIGHT = 1080;

let teamIdx = 0;

var players = {};

var PERK_TYPE = {
    ENHANCE_SCOPE: 'enhance-scope',
    ENHANCE_SPEED: 'enhance-speed',
    DISRUPTION_FREEZE: 'disruption-freeze',
    DISRUPTION_NO_SEED: 'disruption-no-seeds'
}

const GAME_LENGTH = +(process.env.GAME_LENGTH) || 30000

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
var gameStatus = "waiting";

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


const getNextTeam = () => {
    return teamNames[teamIdx++];
};

const getRandomTeam = () => {
    const id = (Math.floor(Math.random() * teamNames.length));
    return teamNames[id]
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
    // return true
    const p = Object.values(players);
    return gameStatus !== 'started' && p.filter((p) => !p.ready).length === 0 && p.length > 1;
}

const changeGameStatus = ({gameStatus, data}) => {
    console.log(gameStatus)
    io.emit('gameStatusChanged', {gameStatus, data});

    if (gameStatus === 'started') {
        setTimeout(() => {
            // drop first perk after some time
            io.emit('perkDrop', perk);
        }, Math.random() * 1000 + 2000)
    }
}

const stopGame = () => {
    endTime = null;
    clearTimeout(gameTimeout);
    Object.keys(players).forEach(() => {
        players[socket.id].ready = false;
    })
    changeGameStatus({
        gameStatus: 'finished'
    })
}

const tryToStartGame = () => {
    if (checkGameCanBeStarted()) {
        if (!endTime) {
            endTime = Date.now() + GAME_LENGTH
        }
        changeGameStatus({
            gameStatus: 'started',
            data: {
                endTime
            }
        })

        gameTimeout = setTimeout(() => {
            stopGame();
        }, GAME_LENGTH)
    }
}


const initialPositionsPool = [
    {
        id: 1,
        x: GAME_WIDTH / 4,
        y: GAME_HEIGHT / 4,
        available: true
    },
    {
        id: 2,
        x: GAME_WIDTH - GAME_WIDTH / 4,
        y: GAME_HEIGHT / 4,
        available: true
    },
    {
        id: 3,
        x: GAME_WIDTH / 4,
        y: GAME_HEIGHT - GAME_HEIGHT / 4,
        available: true
    },
    {
        id: 4,
        x: GAME_WIDTH - GAME_WIDTH / 4,
        y: GAME_HEIGHT - GAME_HEIGHT / 4,
        available: true
    }
]

function getInitialPlayerPosition() {
    const position = _.sample(initialPositionsPool.filter(position => position.available));

    if (position) {
        position.available = false;
    }

    return position ?? {
        x: Math.floor(Math.random() * GAME_WIDTH),
        y: Math.floor(Math.random() * GAME_HEIGHT),
    }
}

io.on('connection', function (socket) {
    if (gameStatus === 'started') {
        return false;
    }
    const team = getNextTeam();
    const initialPosition = getInitialPlayerPosition();
    const name = `${_.sample(adjectives)} ${_.sample(names)}`;
    console.log('a user connected: ', socket.id, team);
    // create a new player and add it to our players object
    players[socket.id] = {
        rotation: 0,
        x: initialPosition.x,
        y: initialPosition.y,
        playerId: socket.id,
        name,
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

        io.emit('playerReady', players[socket.id].playerId);
    });
    // update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // when a player disconnects, remove them from our players object
    socket.on('disconnect', function () {
        console.log('user disconnected: ', socket.id);
        delete players[socket.id];
        // emit a message to all players to remove this player
        socket.disconnect(socket.id);
        io.emit('disconnectPlayer', socket.id);
        if (Object.values(players).length <= 1 && gameStatus !== 'waiting') {
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

    socket.on('playersCollision', function ({player1, player2}) {
        io.emit('playerCollided', {player1, player2});

        setTimeout(() => {
            io.emit('playerCanCollideAgain', {player1, player2});
        }, 3000);
    });

    socket.on('perkCollected', function (perkType) {
        // handle perk action
        handlePerk(perkType, players[socket.id].playerId);

        // draw new random perk in random position
        perk = drawNewPerk();

        // notify about new perk drop
        io.emit('perkDrop', perk);
    });


    function handlePerk(perkType, collectingPlayerId) {
        switch (perkType) {
            case PERK_TYPE.ENHANCE_SCOPE:
                handleStarCollection(collectingPlayerId)
                break;
            case PERK_TYPE.ENHANCE_SPEED:
                handleShoeCollection(collectingPlayerId);
                break;
            case PERK_TYPE.DISRUPTION_FREEZE:
                handleClockCollection(collectingPlayerId);
                break;
            case PERK_TYPE.DISRUPTION_NO_SEED:
                handleNoPaintCollection(collectingPlayerId);
                break;
        }
    }

    function handleStarCollection(collectingPlayerId) {
        // notify that big brush has been activated
        io.emit('bigBrushActivated', collectingPlayerId);

        // notify that big brush has been deactivated
        setTimeout(() => {
            io.emit('bigBrushDeactivated', collectingPlayerId);
        }, 3000);
    }

    function handleShoeCollection(collectingPlayerId) {
        // notify that big brush has been activated
        io.emit('shoeActivated', collectingPlayerId);

        // notify that big brush has been deactivated
        setTimeout(() => {
            io.emit('shoeDeactivated', collectingPlayerId);
        }, 2000);
    }

    function handleClockCollection(collectingPlayerId) {
        // notify that big brush has been activated
        io.emit('clockActivated', collectingPlayerId);

        // notify that big brush has been deactivated
        setTimeout(() => {
            io.emit('clockDeactivated', collectingPlayerId);
        }, 1500);
    }

    function handleNoPaintCollection(collectingPlayerId) {

        // notify that big brush has been activated
        io.emit('noPaintActivated', collectingPlayerId);

        // notify that big brush has been deactivated
        setTimeout(() => {
            io.emit('noPaintDeactivated', collectingPlayerId);
        }, 1200);
    }
});

server.listen(process.env.SERVER_PORT || 8081, function () {
    console.log(`Listening on ${server.address().port}`);
});
