import express from 'express';
const router = express.Router();

// Validation middleware for payment
const validatePayment = (req, res, next) => {
  const { name, amount, method, date, user_id } = req.body;
  if (!name || !amount || !method || !date || !user_id) {
    return res.status(400).json({ 
      success: false,
      message: 'Missing required fields: user_id,name, amount, method, date, user_id' 
    });
  }
  next();
};

// GET all payments
router.get('/', async (req, res) => {
  try {
    const [rows] = await req.db.query(
      'SELECT id, name, amount, method, date, user_id, created_at FROM payment'
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
router.post('/', validatePayment, async (req, res) => {
  try {
    const { name, amount, method, date, user_id } = req.body;

    const [result] = await req.db.query(
      'INSERT INTO payment (name, amount, method, date, user_id) VALUES (?, ?, ?, ?, ?)',
      [name, amount, method, date, user_id]
    );

    res.status(201).json({ 
      success: true,
      message: 'Payment created successfully',
      data: { 
        id: result.insertId,
        name,
        amount,
        method,
        date,
        user_id,
        created_at: new Date() // Assuming created_at is the current timestamp
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
router.put('/:id', validatePayment, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, method, date, user_id } = req.body;

    const [result] = await req.db.query(
      'UPDATE payment SET name = ?, amount = ?, method = ?, date = ?, user_id = ? WHERE id = ?',
      [name, amount, method, date, user_id, id]
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
router.delete('/:id', async (req, res) => {
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