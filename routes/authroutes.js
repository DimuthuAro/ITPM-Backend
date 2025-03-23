import { Router } from 'express';
import { hash, compare } from 'bcrypt';

const router = Router();

// Mock user database
const users = [];

// Register route
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const hashedPassword = await hash(password, 10);
    users.push({ email, password: hashedPassword });

    res.status(201).json({ message: 'User registered successfully' });
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log(email, password);

    if (!email || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful', token });
});

export default router;