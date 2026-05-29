import express from 'express';
import cors from 'cors';
import http from 'http';
import cookieParser from 'cookie-parser';
import "dotenv/config"
import { ConnectDB } from './src/config/db.js';
import authRouter from './src/routes/auth.routes.js';
import messageRouter from './src/routes/message.routes.js'
import { Server } from "socket.io"
// import { Socket } from 'dgram';
// server Instances
const app = express();
const server = http.createServer(app);

//initialise socket.io server
export const io = new Server(server, { cors: { origin: "*" } })

function emitOnlineUsers() {
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
}
//store online user
export const userSocketMap = {};

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (!userId) return;

    if (!userSocketMap[userId]) {
        userSocketMap[userId] = [];
    }

    userSocketMap[userId].push(socket.id);

    emitOnlineUsers();

    socket.on("disconnect", () => {
        if (!userSocketMap[userId]) return;

        userSocketMap[userId] = userSocketMap[userId].filter(
            (id) => id !== socket.id
        );

        if (userSocketMap[userId].length === 0) {
            delete userSocketMap[userId];
        }

        emitOnlineUsers();
    });
});
//socket.io connection
// io.on("connection", (socket) => {
//     const userId = socket.handshake.query.userId;
//     console.log("User Connected", userId);
//     if (userId) {
//         userSocketMap[userId] = socket.id;
//     }
        
//         //emit online users to all connected clients 

//         io.emit("getOnlineUsers", Object.keys(userSocketMap));

//         socket.on("disconnect", () => {
//             console.log("User Disconnected", userId);
//             delete userSocketMap[userId];
//             io.emit("getOnlineUsers", Object.keys(userSocketMap));
//         })
// })

//Middlewares
app.use(cors({origin: "http://localhost:5173",credentials: true}))
app.use(express.json({ limit: '4mb' }))
app.use(cookieParser())

// Health check API 
app.get('/', (req, res) => {
    res.send("Api is working")
})

//Routes setup
app.use('/api/auth', authRouter);
app.use('/api/messages', messageRouter)

//Database Conncection
await ConnectDB();
const PORT = process.env.PORT || 3000;

// Starting the server
server.listen(PORT, () => {
    console.log(`Server is running on port :${PORT} `)
})


