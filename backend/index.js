require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Entry = require('./models/Entry');
const User = require('./models/Users');
const authMiddleware = require('./middleware/auth');

// Routes
const aiRoute = require('./routes/ai');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();
app.use(cors());
app.use(express.json());

// Environment variables
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Connect to MongoDB Atlas
const connectDB = require('./db');
connectDB();

//Public test route
app.get('/', (req, res) => res.send('API is running'));

//Health check route
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

//AI Route
app.use('/api/ai', aiRoute);

//Products & Orders
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Register route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid username or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid username or password' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Protected GET route for user-specific entries
app.get('/entries', authMiddleware, async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// Protected POST route to save entry
app.post('/entry', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const newEntry = new Entry({ text, userId: req.user.userId });
    await newEntry.save();
    res.json({ message: 'Saved successfully', entry: newEntry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
