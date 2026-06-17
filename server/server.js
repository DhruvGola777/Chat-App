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

// Middlewares - allowed origins
const allowedOrigins = [
    "http://localhost:5173", 
    "https://chat-app-dhruvs-team1.vercel.app",
    "https://chat-app-three-wine-46.vercel.app"
];

// initialise socket.io server
export const io = new Server(server, { 
    cors: { 
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://192.168.')) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST", "DELETE", "PATCH"],
        credentials: true
    } 
})

function emitOnlineUsers() {
    const onlineUsers = Object.keys(userSocketMap);
    console.log("Emitting online users:", onlineUsers);
    io.emit("getOnlineUsers", onlineUsers);
}
//store online user
export const userSocketMap = {};

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log(`Socket connected: ${socket.id}, userId: ${userId}`);

    if (!userId || userId === "undefined") {
        console.log("Connection rejected: userId is missing or undefined");
        return;
    }

    if (!userSocketMap[userId]) {
        userSocketMap[userId] = [];
    }

    userSocketMap[userId].push(socket.id);

    emitOnlineUsers();

    socket.on("typing", ({ senderId, receiverId }) => {
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("typing", { senderId });
        }
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("stopTyping", { senderId });
        }
    });

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
//Middlewares

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://192.168.')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}))
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

export default server;

