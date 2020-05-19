/*************************************

Server file

**************************************/

// Loads Node module to work with files
const path = require('path');
// Imports http module.
const http = require('http');
// Loads express npm module
const express = require('express');
// Imports socket.io library.
const socketio = require('socket.io');
// Imports bad-words module.
const Filter = require('bad-words');
// Imports module.
const { generateMessage, generateLocationMessage} = require('./utils/messages');
// Imports module.
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');

// server (emit) -> Client (receive) - countUpdated.
// client (emit) -> server (receive) - increment

// Initializes express application.
const app = express();
// Creates server.
// Takes one parameter,
// the express application.
const server = http.createServer(app);
// Configures web socket.
// Takes one parameter,
// the server.
const io = socketio(server);

// Sets up server.
const port = process.env.Port || 3000;

// Sets up public directory
const publicDirectoryPath = path.join(__dirname, '../public')

// Serves up public directory.
app.use(express.static(publicDirectoryPath));


// Shows message when a client connects.
// Takes two parameters,
// name of the event and a function to
// run when the event occurs.
// Runs when clients connect.
io.on('connection', (socket) => {

  console.log("New WebSocket connection")

  // Litsenf for event from the client.
  socket.on('join', ({ username, room }, callback) => {

    // Function call.
    const { error, user} = addUser({ id: socket.id, username, room})

    // Builds if statement.
    if(error) {

      return callback(error)

    }

    // Runs if user was added.
    socket.join(user.room)

    // Sends event to the client.
    socket.emit('message', generateMessage('Admin', 'Welcome!'))
    // Broadcast event.
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))

    // Emits event.
    io.to(user.room).emit('roomData', {

      room: user.room,
      users: getUsersInRoom(user.room)

    })

    callback()

  })

  // Litsens even from the client.
  // Takes three arguments,
  // the name of the event we are emitting
  // and a callback function to run and an acknowledgement
  socket.on('sendMessage', (message, callback) => {

    // Function call.
    const user = getUser(socket.id)

    // Creates instance.
    const filter = new Filter()

    // Builds if statement.
    // Runs if there is profanity
    if(filter.isProfane(message)) {

      return callback('Profanity is not allowed!')

    }

    // Sends message to every connected client.
    io.to(user.room).emit('message', generateMessage(user.username, message))
    callback()

  })

  // Litsens even from the client.
  // Takes two parameters,
  // the name of the event, and a callback
  // function to run.
  socket.on('sendLocation', (coords, callback) => {

    // Function call.
    const user = getUser(socket.id)

    // Shares data with all connected clients.
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps/?q=${coords.latitude},${coords.longitude}`))

    // Calls the callback,
    // letting the client that the event has been acknowledg.
    callback()

  })

  // Runs when socket is disconnected.
  socket.on('disconnect', () => {

    // Funcion call.
    const user = removeUser(socket.id)

    // Builds if statement.
    if (user) {

      // Sends message to every client that it
      // is still connected.
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`))
      io.to(user.room).emit('roomData', {

        room: user.room,
        users: getUsersInRoom(user.room)

      })

    }

  })

});

// Starts the server.
server.listen(port, () => {

  console.log(`Server is up on port ${port}!`)

});
