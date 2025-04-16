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

// User Schema
const userSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, unique: true },
  walletAddress: { type: String, default: null },
  privateKey: { type: String, default: null },
  isLender: { type: Boolean, default: false },
  isBorrower: { type: Boolean, default: false },
  lastLogin: { type: Date, default: Date.now },
  creditScore: { type: Number, default: 0 },
  collateralAddress: { type: String, default: null },
  collateralAmount: { type: Number, default: 0 },
});

const User = mongoose.model('User', userSchema);

// Lender Schema
const lenderSchema = new mongoose.Schema({
  contractId: { type: String, required: true }, // Dummy data for testnet
  lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lendingConditions: { type: String, required: true },
  initialLendingCapacity: { type: Number, required: true },
  lendingAmountBalance: { type: Number, required: true },
  currentBalance: { type: Number, required: true },
  borrowerCount: { type: Number, default: 0 },
  interestRate: { type: Number, required: true }, // New field
  durationDays: { type: Number, required: true }, // New field
  minBorrowAmount: { type: Number, required: true }, // New field
  collateralAddress: { type: String, required: true }, // New field
  collateral: { type: String, required: true }, // New field
});

const Lender = mongoose.model('Lender', lenderSchema);

// Borrow Schema
const borrowSchema = new mongoose.Schema({
  contractId: { type: String, required: true },
  lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lender', required: true },
  borrowAmount: { type: Number, required: true },
  borrowDate: { type: Date, default: Date.now },
  pendingAmount: { type: Number, required: true },
  lastTransactionDetails: { type: String, default: null },
});

const Borrow = mongoose.model('Borrow', borrowSchema);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true, default: () => `txn_${Date.now()}` },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transactionType: { type: String, enum: ['borrow', 'installment'], required: true },
  transactionAmount: { type: Number, required: true },
  transactionDate: { type: Date, default: Date.now },
  secondPartyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastPaidTimestamp: { type: Date, default: null },
  comment: { type: String, default: null },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Routes
// api changes starts here

app.post('/api/auth/addUser', async (req, res) => {
  const { email, walletAddress, privateKey } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if the user already exists
    let user = await User.findOne({ userEmail: email });

    if (!user) {
      // Create a new user
      user = new User({
        userEmail: email,
        walletAddress: walletAddress || null,
        privateKey: privateKey || null,
        isLender: false,
        isBorrower: false,
        lastLogin: new Date(),
        creditScore: 0,
        collateralAddress: null,
        collateralAmount: 0,
      });

      await user.save();
      console.log('New user created:', user);
    } else {
      console.log('User already exists:', user);
    }

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find the user by email
    const user = await User.findOne({ userEmail: email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the lastLogin field
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({ message: 'Login timestamp updated successfully', user });
  } catch (error) {
    console.error('Error updating login timestamp:', error);
    res.status(500).json({ error: 'Failed to update login timestamp' });
  }
});

// app.post('/api/lender/activate', async (req, res) => {
//   const { email, interestRate, durationDays, minBorrowAmount, collateralAddress, collateral } = req.body;

//   try {
//     console.log('POST /api/lender/activate called');
//     console.log('Request body received:', req.body);

//     if (!email) {
//       return res.status(400).json({ error: 'Email is required' });
//     }

//     // Find the user by email
//     const user = await User.findOne({ userEmail: email });
//     console.log('User found in database:', user);

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Update the user's isLender field
//     user.isLender = true;
//     await user.save();
//     console.log('User updated to lender:', user);

//     // Create a new lender record
//     const lender = new Lender({
//       contractId: `contract_${Date.now()}`,
//       lenderId: user._id,
//       lendingConditions: `Interest: ${interestRate}%, Duration: ${durationDays} days`,
//       initialLendingCapacity: minBorrowAmount,
//       lendingAmountBalance: minBorrowAmount,
//       currentBalance: minBorrowAmount,
//       borrowerCount: 0,
//       interestRate,
//       durationDays,
//       minBorrowAmount,
//       collateralAddress,
//       collateral,
//     });

//     await lender.save();
//     console.log('Lender record created:', lender);

//     res.status(201).json({ message: 'Lender account activated successfully', lender });
//   } catch (error) {
//     console.error('Error activating lender account:', error.stack || error.message || error);
//     res.status(500).json({ error: 'Failed to activate lender account' });
//   }
// });

// api changes ends her


app.post('/api/lender/activate', async (req, res) => {
  const { email, interestRate, durationDays, minBorrowAmount, collateralAddress, collateral } = req.body;

  try {
    console.log('POST /api/lender/activate called');
    console.log('Request body received:', req.body);

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find the user by email
    const user = await User.findOne({ userEmail: email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isLender) {
      // Update the user's isLender field if they are not already a lender
      user.isLender = true;
      await user.save();
      console.log('User updated to lender:', user);
    }

    // Check if the lender record already exists
    let lender = await Lender.findOne({ lenderId: user._id });
    if (lender) {
      // Update existing lender record
      lender.interestRate = interestRate;
      lender.durationDays = durationDays;
      lender.minBorrowAmount = minBorrowAmount;
      lender.collateralAddress = collateralAddress;
      lender.collateral = collateral;
      lender.lendingConditions = `Interest: ${interestRate}%, Duration: ${durationDays} days`;
      await lender.save();
      console.log('Lender record updated:', lender);
    } else {
      // Create a new lender record
      lender = new Lender({
        contractId: `contract_${Date.now()}`,
        lenderId: user._id,
        lendingConditions: `Interest: ${interestRate}%, Duration: ${durationDays} days`,
        initialLendingCapacity: minBorrowAmount,
        lendingAmountBalance: minBorrowAmount,
        currentBalance: minBorrowAmount,
        borrowerCount: 0,
        interestRate,
        durationDays,
        minBorrowAmount,
        collateralAddress,
        collateral,
      });
      await lender.save();
      console.log('Lender record created:', lender);
    }

    res.status(201).json({ message: 'Lender account activated successfully', lender });
  } catch (error) {
    console.error('Error activating lender account:', error.stack || error.message || error);
    res.status(500).json({ error: 'Failed to activate lender account' });
  }
});


app.get('/api/lender/details', async (req, res) => {
  const { email } = req.query;

  try {
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find the user by email
    const user = await User.findOne({ userEmail: email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isLender) {
      return res.status(400).json({ error: 'User is not a lender' });
    }

    // Find the lender details
    const lender = await Lender.findOne({ lenderId: user._id });
    if (!lender) {
      return res.status(404).json({ error: 'Lender details not found' });
    }

    res.status(200).json({ user, lender });
  } catch (error) {
    console.error('Error fetching lender details:', error);
    res.status(500).json({ error: 'Failed to fetch lender details' });
  }
});

app.get('/api/lenders', async (req, res) => {
  try {
    const lenders = await Lender.find({});
    res.status(200).json(lenders);
  } catch (error) {
    console.error('Error fetching lenders:', error);
    res.status(500).json({ error: 'Failed to fetch lenders' });
  }
});


app.post('/api/borrow', async (req, res) => {
  const { contractId, lenderId, borrowAmount, pendingAmount, lastTransactionDetails } = req.body;

  try {
    if (!contractId || !lenderId || !borrowAmount || !pendingAmount) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const borrow = new Borrow({
      contractId,
      lenderId,
      borrowAmount,
      pendingAmount,
      lastTransactionDetails,
    });

    await borrow.save();
    res.status(201).json({ message: 'Borrow request created successfully', borrow });
  } catch (error) {
    console.error('Error creating borrow request:', error);
    res.status(500).json({ error: 'Failed to create borrow request' });
  }
});

app.post('/api/transaction', async (req, res) => {
  const { userId, transactionType, transactionAmount, secondPartyId, comment } = req.body;

  try {
    if (!userId || !transactionType || !transactionAmount || !secondPartyId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const transaction = new Transaction({
      userId,
      transactionType,
      transactionAmount,
      secondPartyId,
      comment,
    });

    await transaction.save();
    res.status(201).json({ message: 'Transaction recorded successfully', transaction });
  } catch (error) {
    console.error('Error recording transaction:', error);
    res.status(500).json({ error: 'Failed to record transaction' });
  }
});

// Start server
const PORT = process.env.PORT || 9090;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));