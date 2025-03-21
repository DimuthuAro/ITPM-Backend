// routes/userRoutes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import cors from 'cors';
const router = express.Router();

// Enable CORS
router.use(cors());

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
router.post('/users',  async (req, res) => {
  try {
    const { name, email, password } = req.body;

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


// GET all notes
router.get('/notes', async (req, res) => {
  try {
    const [rows] = await req.db.query(
      'SELECT id, title, category, description FROM note'
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


// POST create note
router.post('/notes', async (req, res) => {
  try {
    const { title, category, description } = req.body;

    // Check if title exists
    const [existing] = await req.db.query(
      'SELECT id FROM note WHERE title = ?',
      [title]
    );

    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false,
        message: 'title already exists' 
      });
    }

    const [result] = await req.db.query(
      'INSERT INTO note (title, category, description) VALUES (?, ?, ?)',
      [title, category, description]
    );

    res.status(201).json({ 
      success: true,
      message: 'ote created successfully',
      data: { 
        id: result.insertId,
        title,
        category,
        description
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
router.put('/users/:id', validateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await req.db.query(
      'UPDATE user SET name = ?, email = ?, password = ? WHERE id = ?',
      [name, email, hashedPassword, id]
    );

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
router.delete('/users/:id', async (req, res) => {
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

// PUT update note
router.put('/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, description } = req.body;

    const [result] = await req.db.query(
      'UPDATE note SET title = ?, category = ?, description = ? WHERE id = ?',
      [title, category, description, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Note not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Note updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to update note',
      error: error.message 
    });
  }
});

// DELETE note
router.delete('/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await req.db.query(
      'DELETE FROM note WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Note not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Note deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete note',
      error: error.message 
    });
  }
});

// GET all payments
router.get('/payments', async (req, res) => {
  try {
    const [rows] = await req.db.query(
      'SELECT id, amount, method, status FROM payment'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch payments',
      error: error.message 
    });
  }
});

// POST create payment
router.post('/payments', async (req, res) => {
  try {
    const { amount, method, status } = req.body;

    const [result] = await req.db.query(
      'INSERT INTO payment (amount, method, status) VALUES (?, ?, ?)',
      [amount, method, status]
    );

    res.status(201).json({ 
      success: true,
      message: 'Payment created successfully',
      data: { 
        id: result.insertId,
        amount,
        method,
        status
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to create payment',
      error: error.message 
    });
  }
});

// PUT update payment
router.put('/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, method, status } = req.body;

    const [result] = await req.db.query(
      'UPDATE payment SET amount = ?, method = ?, status = ? WHERE id = ?',
      [amount, method, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Payment not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Payment updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to update payment',
      error: error.message 
    });
  }
});

// DELETE payment
router.delete('/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await req.db.query(
      'DELETE FROM payment WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Payment not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Payment deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete payment',
      error: error.message 
    });
  }
});

export default router;
