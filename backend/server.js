import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000;
const JWT_SECRET = "supersecretjwt12345678901234567890";

// MongoDB Connection
mongoose.connect('mongodb+srv://zainali5911295_db_user:H21wTATyBLgb2Jlz@bettingdb.g0y6m4z.mongodb.net/bettingdb')
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err.message));

// User Model
const User = mongoose.model('User', new mongoose.Schema({
  email: String,
  password: String,
  role: String,
  name: String
}));

// Create Default Admin
const createAdmin = async () => {
  try {
    const existing = await User.findOne({ email: "admin@admin.com" });
    if (existing) {
      console.log("✅ Default Admin already exists");
      return;
    }

    const hashed = await bcrypt.hash("admin123", 10);
    await User.create({
      email: "admin@admin.com",
      password: hashed,
      role: "admin",
      name: "Admin"
    });
    console.log("✅ Default Admin Created (admin@admin.com / admin123)");
  } catch (e) {
    console.log("Admin Creation Error:", e.message);
  }
};

// Login Route
app.post('/auth/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id, role: "admin" }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ 
      ok: true, 
      token,
      user: { email: user.email, role: "admin" }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get('/', (req, res) => res.json({ message: "Backend is running" }));

// Start Server
createAdmin().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`Login with: admin@admin.com / admin123`);
  });
});