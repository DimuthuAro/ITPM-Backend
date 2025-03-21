import express from 'express';
const router = express.Router();

// Validation middleware for note
const validateNote = (req, res, next) => {
  if (!req.body.title || !req.body.category || !req.body.description || !req.body.user_id) {
    return res.status(400).json({ 
      success: false,
      message: 'Missing required fields: title, category, description, user_id' 
    });
  }
  next();
};

// GET all notes
router.get('/', async (req, res) => {
  try {
    const [rows] = await req.db.query(
      'SELECT id, title, category, description, user_id, created_at FROM note'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch notes',
      error: error.message 
    });
  }
});

// POST create note
router.post('/', validateNote, async (req, res) => {
  try {
    const { title, category, description, user_id } = req.body;

    // Check if title exists
    const [existing] = await req.db.query(
      'SELECT id FROM note WHERE title = ?',
      [title]
    );

    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false,
        message: 'Title already exists' 
      });
    }

    const [result] = await req.db.query(
      'INSERT INTO note (title, category, description, user_id) VALUES (?, ?, ?, ?)',
      [title, category, description, user_id]
    );

    res.status(201).json({ 
      success: true,
      message: 'Note created successfully',
      data: { 
        id: result.insertId,
        title,
        category,
        description,
        user_id
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to create note',
      error: error.message 
    });
  }
});

// PUT update note
router.put('/:id', validateNote, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, description, user_id } = req.body;

    const [result] = await req.db.query(
      'UPDATE note SET title = ?, category = ?, description = ?, user_id = ? WHERE id = ?',
      [title, category, description, user_id, id]
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
router.delete('/:id', async (req, res) => {
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

export default router;