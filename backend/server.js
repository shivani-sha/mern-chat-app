const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });

console.log("MONGO_URI:", process.env.MONGO_URI);

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const colors = require("colors");

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { log } = require("console");

//dotenv.config();

connectDB();

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Enable CORS to allow cross-origin requests
app.use(cors());

// Debugging middleware: log every incoming request's body
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.url} with body:`, req.body);
  next();
});

 


// API routes
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

//---------------------Deployment--------------------

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
  });
} else {
  
}app.get("/", (req, res) => {
  res.send("API is Running Successfully");
});
//----------------------Deployment--------------------


// Middleware to handle 404 - Not Found errors
app.use(notFound);

// Middleware to handle other errors
app.use(errorHandler);

// Use PORT from env or fallback to 5000
const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);

const io = require('socket.io')(server, {
  pingTimeout: 600000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");
  
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room:" + room);
    
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
  

 socket.on("new message", (newMessageRecieved) => {
  const chat = newMessageRecieved.chat;

  console.log("New message recieved in chat:", chat._id);
  console.log("Users in chat:", chat.users.map(u => u._id));

  if (!chat || !chat._id) return console.log("Chat or chat ID is missing");
  if (!chat.users) return console.log("chat.users not defined");

  socket.to(chat._id).emit("message recieved", newMessageRecieved);
});

});