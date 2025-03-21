import express from 'express';
const router = express.Router();

// Validation middleware for ticket
const validateTicket = (req, res, next) => {
  if (!req.body.title || !req.body.description || !req.body.status || !req.body.user_id) {
    return res.status(400).json({ 
      success: false,
      message: 'Missing required fields: title, description, status, user_id' 
    });
  }
  next();
};

// GET all tickets
router.get('/', async (req, res) => {
  try {
    const [rows] = await req.db.query(
      'SELECT id, title, description, status, user_id, created_at FROM ticket'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch tickets',
      error: error.message 
    });
  }
});

// POST create ticket
router.post('/',  async (req, res) => {
  try {
    const { title, description, status, user_id } = req.body;

    const [result] = await req.db.query(
      'INSERT INTO ticket (title, description, status, user_id) VALUES (?, ?, ?, ?)',
      [title, description, status, user_id]
    );

    res.status(201).json({ 
      success: true,
      message: 'Ticket created successfully',
      data: { 
        id: result.insertId,
        title,
        description,
        status,
        user_id
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to create ticket',
      error: error.message 
    });
  }
});

// PUT update ticket
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, user_id } = req.body;

    const [result] = await req.db.query(
      'UPDATE ticket SET title = ?, description = ?, status = ?, user_id = ? WHERE id = ?',
      [title, description, status, user_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Ticket not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Ticket updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to update ticket',
      error: error.message 
    });
  }
});

// DELETE ticket
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await req.db.query(
      'DELETE FROM ticket WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Ticket not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Ticket deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete ticket',
      error: error.message 
    });
  }
});

export default router;