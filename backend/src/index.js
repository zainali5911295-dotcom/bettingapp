import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import http from 'http';
import { Server } from 'socket.io';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const app = express();
const server = http.createServer(app);

// ==================== SOCKET.IO SETUP ====================
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:4002",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:4002"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });

  // Aviator specific events (baad mein extend kar sakte ho)
  socket.on('join-aviator', () => {
    socket.join('aviator-room');
    console.log(`User ${socket.id} joined aviator room`);
  });
});

app.use(express.json());
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://localhost:4002', 'http://127.0.0.1:3000', 'http://127.0.0.1:4002'],
  credentials: true 
}));

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwt1234567890";

// ... (baaki sara code same rahega - User Model, Game Model, AviatorRound etc.)

// ==================== USER MODEL ====================
const User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  username: String,
  balance: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}));

// ==================== GAME MODEL ====================
const gameSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  minBet: { type: Number, default: 10 },
  maxBet: { type: Number, default: 10000 },
  commission: { type: Number, default: 2.5 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  players: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Game = mongoose.model('Game', gameSchema);

// ==================== AVIATOR ROUND MODEL ====================
const aviatorRoundSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true },
  currentMultiplier: { type: Number, default: 1.00 },
  crashPoint: { type: Number, default: null },
  status: { type: String, enum: ['flying', 'crashed'], default: 'flying' },
  startedAt: { type: Date, default: Date.now },
  endedAt: Date,
  totalBets: { type: Number, default: 0 }
});

const AviatorRound = mongoose.model('AviatorRound', aviatorRoundSchema);

// ==================== CREATE ADMIN + SEED GAMES ====================
const createAdmin = async () => { /* same as before */ };
const seedDefaultGames = async () => { /* same as before */ };

// ==================== AUTH + APIs (same as tumne diya tha) ====================
// ... (tumhara sara auth aur API code yahan same rahega)

app.get('/api/game/aviator/current', async (req, res) => {
  // same as before
});

app.post('/api/game/aviator/cashout', async (req, res) => {
  // same as before
});

app.get('/', (req, res) => res.send("Backend Running"));

// ==================== START SERVER ====================
createAdmin();
seedDefaultGames();

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO ready for connections`);
});