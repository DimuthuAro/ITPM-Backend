import express from 'express';
import bcrypt from 'bcrypt';
const router = express.Router();

// Validation middleware for user
const validateUser = (req, res, next) => {
  if (!req.body.name || !req.body.email || !req.body.password) {
    return res.status(400).json({ 
      success: false,
      message: 'Missing required fields: name, email, password' 
    });
  }
  next();
};

// GET all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await req.db.query(
      'SELECT id, name, email, created_at FROM user'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
});

// POST create user
router.post('/', async (req, res) => {
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
      [name, email, hashedPassword]
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

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const { name, email, password } = req.body;
    let query = 'UPDATE user SET name = ?, email = ?';
    const params = [name, email];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await req.db.query(query, params);
    console.log(result);
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

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
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await req.db.query(
      'DELETE FROM user WHERE id = ?',
      [id]
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