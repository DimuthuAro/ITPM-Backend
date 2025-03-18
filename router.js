// routes/userRoutes.js
import express from 'express';
import bcrypt from 'bcryptjs';
const router = express.Router();

// Validation middleware
const validateUser = (req, res, next) => {
  if (!req.body.name || !req.body.email || !req.body.password) {
    return res.status(400).json({ 
      success: false,
      message: 'Missing required fields: name, email, password' 
    });
  }
  next();
};

// GET /api
router.get('/', (_, res) => {
  res.json({ 
    success: true,
    message: 'Welcome to the User API!' 
  });
});

// GET all users
router.get('/users', async (req, res) => {
  try {
    const [rows] = await req.db.query(
      'SELECT id, name, email FROM user'
    );
    res.json({ 
      success: true,
      data: rows 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
});

// POST create user
router.post('/users', validateUser, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if email exists
    const [existing] = await req.db.query(
      'SELECT id FROM user WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false,
        message: 'Email already exists' 
      });
    }

    const [result] = await req.db.query(
      'INSERT INTO user (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );

    res.status(201).json({ 
      success: true,
      message: 'User created successfully',
      data: { 
        id: result.insertId,
        name,
        email
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to create user',
      error: error.message 
    });
  }
});

// GET single user
router.get('/users/:id', async (req, res) => {
  try {
    const [rows] = await req.db.query(
      'SELECT id, name, email FROM user WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true,
      data: rows[0] 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch user',
      error: error.message 
    });
  }
});

// PUT update user
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.params.id;

    if (!name || !email) {
      return res.status(400).json({ 
        success: false,
        message: 'Name and email are required' 
      });
    }

    // Check if user exists
    const [existing] = await req.db.query(
      'SELECT id FROM user WHERE id = ?',
      [userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    await req.db.query(
      'UPDATE user SET name = ?, email = ? WHERE id = ?',
      [name, email, userId]
    );

    res.json({ 
      success: true,
      message: 'User updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to update user',
      error: error.message 
    });
  }
});

// DELETE user
router.delete('/users/:id', async (req, res) => {
  try {
    const [result] = await req.db.query(
      'DELETE FROM user WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'User deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete user',
      error: error.message 
    });
  }
});

export default router;