const path = require('path');
const http  =require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages.js');
const { 
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('./utils/users.js');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord Bot';

  // Run when client connects
  io.on("connection", (socket) => {
    console.log(io.of("/").adapter);
    socket.on("joinRoom", ({ username, room }) => {
      const user = userJoin(socket.id, username, room);
  
      socket.join(user.room);
  
      // Welcome current user
      socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));
  
      // Broadcast when a user connects
      socket.broadcast
        .to(user.room)
        .emit(
          "message",
          formatMessage(botName, `${user.username} has joined the chat`)
        );
  
      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    });
  
    // Listen for chatMessage
    socket.on("chatMessage", (msg) => {
      const user = getCurrentUser(socket.id);
  
      io.to(user.room).emit("message", formatMessage(user.username, msg));
    });
  
    // Runs when client disconnects
    socket.on("disconnect", () => {
      const user = userLeave(socket.id);
  
      if (user) {
        io.to(user.room).emit(
          "message",
          formatMessage(botName, `${user.username} has left the chat`)
        );
  
        // Send users and room info
        io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room),
        });
      }
    });
  });
  


const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server runnning on port ${PORT}`));



// //run when client connects
// io.on('connection', socket => {
//     socket.emit('joinRoom', ({username, room }) => {

//         //create user
//         const user = userJoin(socket.id, username, room);
//         socket.join(user.room);

//         //welcome user
//         socket.emit('message', formatMessage(botName, 'Welcome to ChatCord'));

//         //broadcast when a user connects
//         socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));

//         // Send users and room info
//         io.to(user.room).emit("roomUsers", {
//         room: user.room,
//         users: getRoomUsers(user.room),
//         });
//     });

//         //listen for chatMessage
//         socket.on('chatMessage', (msg) => {
//             const user = getCurrentUser(socket.id);
//             io.emit('message', formatMessage(user.username, msg));
//         });

//     //runs when client dcs
//     socket.on('disconnect', () => {
//         io.emit('message', formatMessage(botName, 'A user has left the chat'));
//     });
// });

// (async () => {
//     pubClient = createClient({ url: "redis://127.0.0.1:6379" });
//     await pubClient.connect();
//     subClient = pubClient.duplicate();
//     io.adapter(createAdapter(pubClient, subClient));
//   })();
  