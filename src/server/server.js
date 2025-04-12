require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect('mongodb+srv://neelwanprashant:bMllontSe3A9cg8L@cluster0.fv0rl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// User Schema and Model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
});

const User = mongoose.model('User', userSchema);

// Lender Schema and Model
const lenderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Foreign key to User
  interest: { type: Number, required: true },
  amount: { type: Number, required: true },
  collateral: { type: String, required: true },
  duration: { type: Number, required: true }, // Duration in months or days
});

const Lender = mongoose.model('Lender', lenderSchema);

// API Endpoint to Fetch All Lenders
app.get('/api/lenders', async (req, res) => {
  try {
    const lenders = await Lender.find().populate('userId', 'email'); // Populate user email
    res.status(200).json(lenders);
  } catch (error) {
    console.error('Error fetching lenders:', error);
    res.status(500).json({ error: 'Failed to fetch lenders' });
  }
});

// API Endpoint to Handle Borrow Requests
app.post('/api/borrow', async (req, res) => {
  const { lenderId } = req.body;

  try {
    if (!lenderId) {
      return res.status(400).json({ error: 'Lender ID is required' });
    }

    // Perform borrow logic (e.g., update lender status, create borrow record)
    console.log(`Borrow request submitted for lender ID: ${lenderId}`);

    res.status(200).json({ message: 'Borrow request submitted successfully' });
  } catch (error) {
    console.error('Error processing borrow request:', error);
    res.status(500).json({ error: 'Failed to process borrow request' });
  }
});

// API Endpoint for Adding User Email
app.post('/api/auth/addUser', async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if the user already exists in the database
    let user = await User.findOne({ email });

    if (!user) {
      // If user does not exist, create a new user
      user = new User({ email });
      await user.save();
      console.log('New user created:', user);
    } else {
      console.log('User already exists:', user);
    }

    // Return the user email
    res.status(200).json({ email: user.email });
  } catch (error) {
    console.error('Error during user addition:', error);
    res.status(500).json({ error: 'Failed to add user' });
  }
});

// Start server
const PORT = process.env.PORT || 9090;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));