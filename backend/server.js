const express = require('express');
const app = express();
const server = require('http').Server(app);
const { ExpressPeerServer } = require('peer'); //peer server for wrapping webRTC

let cors = require('cors')
app.use(cors())

app.use(function (req, res, next) {
  //Enabling CORS
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

const port = process.env.PORT || 8000;

//seeting up socket.io
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
}); 

app.use(express.static('public'));

app.get('/', (req, res) => {
  return res.json({ message: 'Hello from server' });
});

app.use('/room', require('./rooms/create'));


//setting up peerjs library
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/app',
  allow_discovery: true
});
 
app.use('/peerjs', peerServer);

/* 
  socket events/connection handler
  io.emit - emits to all in room 
  socket.broadcast - emits to all except emitter in room
*/
io.on('connection', socket => {

  //joining room event handler
  socket.on('join-room', (roomId, userId, name, uid) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit('user-connected', userId, name, uid);
    socket.once('disconnect', () => {
      socket.leave(roomId)
      socket.broadcast.to(roomId).emit('user-disconnected', userId, name);
    })
  });

  //leave room event handler
  socket.on('leave-room', (roomId, userId, name) => {
    socket.leave(roomId)
    socket.once('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId, name);
    })
  });

  //notification[alerts] event handler
  socket.on('notification', (roomId, name) => {
    io.in(roomId).emit('notify-room', name);
  });

  //chat during meeting
  socket.on('send-message', (roomId, name, msg, time) => {
    io.in(roomId).emit('message', name, msg, time);
  });

})

//server set up complete
server.listen(port, () => {
  console.log('App is live.')
});