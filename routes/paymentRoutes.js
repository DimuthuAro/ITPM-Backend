import express from 'express';
const router = express.Router();

// Validation middleware for payment
const validatePayment = (req, res, next) => {
  if (!req.body.amount || !req.body.method || !req.body.user_id) {
    return res.status(400).json({ 
      success: false,
      message: 'Missing required fields: amount, method, user_id' 
    });
  }
  next();
};

// GET all payments
router.get('/', async (req, res) => {
  try {
    const [rows] = await req.db.query(
      'SELECT id, amount, method, user_id, created_at FROM payment'
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
    const { amount, method, user_id } = req.body;

    const [result] = await req.db.query(
      'INSERT INTO payment (amount, method, user_id) VALUES (?, ?, ?)',
      [amount, method, user_id]
    );

    res.status(201).json({ 
      success: true,
      message: 'Payment created successfully',
      data: { 
        id: result.insertId,
        amount,
        method,
        user_id
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
    const { amount, method, user_id } = req.body;

    const [result] = await req.db.query(
      'UPDATE payment SET amount = ?, method = ?, user_id = ? WHERE id = ?',
      [amount, method, user_id, id]
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