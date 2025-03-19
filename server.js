// app.js
import express from 'express';
import mysql from 'mysql2/promise';
// Removed unused bcrypt import
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "notegenius",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Database middleware
app.use((req, _, next) => {
  req.db = pool;
  next();
});

// Routes
import router from './router.js';
app.use('/api', router);
app.use(cors());
// Error handling middleware
app.use((err, _, res, __) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});