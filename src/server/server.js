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

// API Endpoint for Lender Activation
app.post('/api/lenderActivate', async (req, res) => {
  const { email, interest, amount, duration, collateral } = req.body;

  try {
    if (!email || !interest || !amount || !duration || !collateral) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = user._id;

    // Create a new Lender entry
    const lender = new Lender({
      userId,
      interest,
      amount,
      collateral,
      duration,
    });

    await lender.save();
    console.log('New lender created:', lender);

    // Respond with success
    res.status(201).json({ message: 'Lender activated successfully', lender });
  } catch (error) {
    console.error('Error during lender activation:', error);
    res.status(500).json({ error: 'Failed to activate lender' });
  }
});

// Start server
const PORT = process.env.PORT || 9090;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));