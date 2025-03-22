// app.js
import express from 'express';
import mysql from 'mysql2/promise';
// Removed unused bcrypt import
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*'
}));
// Database connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "JSd185m7#",
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
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tickets', ticketRoutes);


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