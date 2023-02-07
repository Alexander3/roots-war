var express = require('express');
var _ = require('lodash');
var app = express();
var server = require('http').Server(app);
var { names, adjectives } = require('./src/data/names');
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
let timeouts = [];

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
  const minPlayers = +process.env.MIN_PLAYERS || 2;
  return gameStatus !== 'started' && p.filter((p) => !p.playerReady).length === 0 && p.length >= minPlayers;
}

const changeGameStatus = ({ gameStatus, data }) => {
  console.log(gameStatus)
  io.emit('gameStatusChanged', { gameStatus, data });

  if (gameStatus === 'started') {
    createEmitTimeout('perkDrop', perk, Math.random() * 1000 + 2000)
  }
}

const stopGame = (status = "finished") => {
  endTime = null;
  clearTimeout(gameTimeout);
  timeouts.forEach((timeout) => {
    clearTimeout(timeout)
  });
  changeGameStatus({
    gameStatus: status
  })
  io.emit('currentPlayers', players);
}

const clearGame = () => {
  stopGame();
  players = {};
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

    clearTimeout(gameTimeout)
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

function createEmitTimeout(eventName, data = {}, delay = 3000) {
  const timeout = setTimeout(() => {
    io.emit(eventName, data);
  }, delay)
  timeouts.push(timeout);
}

io.on('connection', function (socket) {
  if (gameStatus === 'started') {
    return false;
  }
  const team = getTeam();
  const initialPosition = getInitialPlayerPosition();
  const name = `${_.sample(adjectives)} ${_.sample(names)}`;
  // create a new player and add it to our players object
  players[socket.id] = {
    rotation: 0,
    x: initialPosition.x,
    y: initialPosition.y,
    playerId: socket.id,
    playerReady: false,
    name,
    team
  };
  console.log('a user connected: ', socket.id, team);
  console.log('total: ', Object.values(players).length);
  // send the players object to the new player
  io.emit('currentPlayers', players);
  socket.emit('currentPlayers', players);

  // when a player moves, update the player data
  socket.on('playerReady', function (status) {
    players[socket.id].playerReady = status;
    console.log(players, socket.id, status)
    const timeout = setTimeout(() => {
      tryToStartGame();
    }, 2000)
    timeouts.push(timeout);

    io.emit('playerReady', {
      playerId: players[socket.id].playerId,
      status
    });
  });
  // update all other players of the new player
  // socket.broadcast.emit('newPlayer', players[socket.id]);

  // when a player disconnects, remove them from our players object
  socket.on('disconnect', function () {
    console.log('user disconnected: ', socket.id);
    delete players[socket.id];
    // emit a message to all players to remove this player
    socket.disconnect(socket.id);
    io.emit('disconnectPlayer', socket.id);
    tryToStartGame();
    if (Object.values(players).length <= 1 && gameStatus !== 'waiting') {
      stopGame("waiting");
    }
    if (Object.values(players).length < 1) {
      clearGame("waiting");
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

  socket.on('playersCollision', function (data) {
    io.emit('playerCollided', data);
    createEmitTimeout('playerCanCollideAgain', data, 3000)
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
        handleBigBrushCollection(collectingPlayerId)
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

  function handleBigBrushCollection(collectingPlayerId) {
    io.emit('bigBrushActivated', collectingPlayerId);
    createEmitTimeout('bigBrushDeactivated', collectingPlayerId)
  }

  function handleShoeCollection(collectingPlayerId) {
    io.emit('shoeActivated', collectingPlayerId);
    createEmitTimeout('shoeActivated', collectingPlayerId, 2000)
  }

  function handleClockCollection(collectingPlayerId) {
    io.emit('clockActivated', collectingPlayerId);
    createEmitTimeout('clockDeactivated', collectingPlayerId, 1500)
  }

  function handleNoPaintCollection(collectingPlayerId) {
    io.emit('noPaintActivated', collectingPlayerId);
    createEmitTimeout('noPaintDeactivated', collectingPlayerId, 1200)
  }
});

server.listen(process.env.SERVER_PORT || 8081, function () {
  console.log(`Listening on ${server.address().port}`);
});
