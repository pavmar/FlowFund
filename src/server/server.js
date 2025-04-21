require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ethers, JsonRpcProvider } = require('ethers'); // Import ethers.js

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
  address: { type: String, default: null }, // Add address field
  phoneNumber: { type: String, default: null }, // Add phone number field
});

const User = mongoose.model('User', userSchema);

// Lender Schema
const lenderSchema = new mongoose.Schema({
  contractId: { type: String, required: true }, // Dummy data for testnet
  lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true }, // Add user email to the schema
  lendingConditions: { type: String, required: true },
  initialLendingCapacity: { type: Number, required: true },
  lendingAmount: { type: Number, required: true },
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
  lenderEmail: { type: String, required: true }, // Add lender email to the schema
  borrowerUserEmail: { type: String, required: true }, // Store the borrower's email
  borrowAmount: { type: Number, required: true },
  borrowDate: { type: Date, default: Date.now },
  pendingAmount: { type: Number, required: true },
  lastTransactionDetails: { type: String, default: null },
  collateral: {
    ethereumNetwork: { type: String, required: true }, // Ethereum network (e.g., mainnet, testnet)
    accountAddress: { type: String, required: true }, // Account address of the borrower
    collateralAmount: { type: Number, required: true }, // Collateral amount in ETH or other units
  },
});

const Borrow = mongoose.model('Borrow', borrowSchema);

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

app.post('/api/lender/activate', async (req, res) => {
  const { email, interestRate, durationDays, minBorrowAmount } = req.body;

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
      // Update the user's isLender field if they are not already a lender
      user.isLender = true;
      await user.save();
    }

    // Check if the lender record already exists
    let lender = await Lender.findOne({ lenderId: user._id });
    if (lender) {
      // Update existing lender record
      lender.interestRate = interestRate;
      lender.durationDays = durationDays;
      lender.minBorrowAmount = minBorrowAmount;
      lender.userEmail = email; // Update the email field
      await lender.save();
    } else {
      // Create a new lender record
      lender = new Lender({
        contractId: user.walletAddress, // Assuming walletAddress is used as contractId
        lenderId: user._id,
        userEmail: email, // Save the user's email
        lendingConditions: `Interest: ${interestRate}%, Duration: ${durationDays} days`,
        initialLendingCapacity: minBorrowAmount,
        lendingAmount: 0,
        currentBalance: minBorrowAmount,
        borrowerCount: 0,
        interestRate,
        durationDays,
        minBorrowAmount,
        collateralAddress: user.walletAddress, // Assuming walletAddress is used as collateralAddress
        collateral: 'ETH', // Default collateral type
      });
      await lender.save();
    }

    res.status(201).json({ message: 'Lender account activated successfully', lender });
  } catch (error) {
    console.error('Error activating lender account:', error);
    res.status(500).json({ error: 'Failed to activate lender account' });
  }
});

app.get('/api/lender/details', async (req, res) => {
  const { email } = req.query;

  try {
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ userEmail: email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const lender = await Lender.findOne({ lenderId: user._id });
    if (!lender) {
      return res.status(404).json({ error: 'Lender record not found' });
    }

    res.status(200).json({
      lender,
      walletAddress: user.walletAddress, // Include walletAddress in the response
    });
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

app.post('/api/searchBorrow', async (req, res) => {
  const { borrowerUserEmail, lenderEmail } = req.body;

  try {
    if (!borrowerUserEmail || !lenderEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

  
    console.log('Searching for borrow record with borrowerUserEmail:', borrowerUserEmail, 'and lenderEmail:', lenderEmail);
    // Search the Borrow table with matching borrowerUserEmail and lenderId
    const borrow = await Borrow.findOne({ borrowerUserEmail, lenderEmail});

    console.log('Borrow record found:', borrow);
    // Always return success
    return res.status(200).json({
      message: borrow ? 'Existing borrow record found' : 'No borrow record found',
      borrow: borrow || null, // Return the borrow record if found, otherwise null
    });
  } catch (error) {
    console.error('Error fetching borrow record:', error);
    res.status(500).json({ error: 'Failed to fetch borrow record' });
  }
});

app.post('/api/auth/updateWalletAddress', async (req, res) => {
  const { email, walletAddress } = req.body;

  try {
    if (!email || !walletAddress) {
      return res.status(400).json({ error: 'Email and walletAddress are required' });
    }

    const user = await User.findOneAndUpdate(
      { userEmail: email },
      { walletAddress },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Wallet address updated successfully:', user);
    res.status(200).json({ message: 'Wallet address updated successfully', user });
  } catch (error) {
    console.error('Error updating wallet address:', error);
    res.status(500).json({ error: 'Failed to update wallet address' });
  }
});

app.post('/api/auth/updateUserDetails', async (req, res) => {
  const { email, walletAddress, privateKey } = req.body;

  try {
    if (!email || !walletAddress || !privateKey) {
      return res.status(400).json({ error: 'Email, wallet address, and private key are required' });
    }

    const user = await User.findOneAndUpdate(
      { userEmail: email },
      { walletAddress, privateKey },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User details updated successfully', user });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ error: 'Failed to update user details' });
  }
});

app.get('/api/user/details', async (req, res) => {
  const { email } = req.query;

  try {
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ userEmail: email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      walletAddress: user.walletAddress || null,
      privateKey: user.privateKey || null,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

app.get('/api/user/profile', async (req, res) => {
  const { email } = req.query;

  try {
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ userEmail: email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      address: user.address || null,
      phoneNumber: user.phoneNumber || null,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

app.post('/api/user/updateAddress', async (req, res) => {
  const { email, address } = req.body;

  try {
    if (!email || !address) {
      return res.status(400).json({ error: 'Email and address are required' });
    }

    const user = await User.findOneAndUpdate(
      { userEmail: email },
      { address },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Address updated successfully', user });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

app.post('/api/user/updatePhoneNumber', async (req, res) => {
  const { email, phoneNumber } = req.body;

  try {
    if (!email || !phoneNumber) {
      return res.status(400).json({ error: 'Email and phone number are required' });
    }

    const user = await User.findOneAndUpdate(
      { userEmail: email },
      { phoneNumber },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Phone number updated successfully', user });
  } catch (error) {
    console.error('Error updating phone number:', error);
    res.status(500).json({ error: 'Failed to update phone number' });
  }
});

app.post('/api/auth/checkUser', async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if the user exists in the database
    let user = await User.findOne({ userEmail: email });

    if (!user) {
      // Add the user to the database if they don't exist
      user = new User({
        userEmail: email,
        walletAddress: null, // Default value
        privateKey: null, // Default value
        isLender: false,
        isBorrower: false,
        lastLogin: new Date(),
        creditScore: 0,
        collateralAddress: null,
        collateralAmount: 0,
      });

      await user.save();
      console.log('New user added to the database:', user);
    }

    res.status(200).json({ message: 'User check/add operation completed successfully', user });
  } catch (error) {
    console.error('Error checking or adding user:', error);
    res.status(500).json({ error: 'Failed to check or add user' });
  }
});

app.post('/api/user/updateCollateral', async (req, res) => {
  const { email, ethereumNetwork, accountAddress, collateralAmount } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOneAndUpdate(
      { userEmail: email },
      { collateralAddress: accountAddress, collateralAmount },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Collateral details updated successfully', user });
  } catch (error) {
    console.error('Error updating collateral details:', error);
    res.status(500).json({ error: 'Failed to update collateral details' });
  }
});

app.post('/api/borrow', async (req, res) => {
  const {
    contractId,
    lenderId,
    lenderEmail, // Accept lender email from the frontend
    borrowerUserEmail,
    borrowAmount,
    pendingAmount,
    lastTransactionDetails,
    collateral,
  } = req.body;

  try {
    if (!borrowerUserEmail || !lenderId || !lenderEmail || !borrowAmount || !pendingAmount || !collateral) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate that the lender exists
    const lender = await Lender.findById(lenderId);
    if (!lender) {
      return res.status(404).json({ error: 'Lender not found' });
    }

    // Create a new borrow record with the lender's details
    const borrow = new Borrow({
      contractId: lender.contractId, // Use the contract ID from the lender
      lenderId: lender._id, // Use the lender's ID
      lenderEmail, // Save the lender's email
      borrowerUserEmail,
      borrowAmount,
      pendingAmount,
      lastTransactionDetails,
      collateral,
    });

    await borrow.save();
    res.status(201).json({ message: 'Borrow record added successfully', borrow });
  } catch (error) {
    console.error('Error adding borrow record:', error);
    res.status(500).json({ error: 'Failed to add borrow record' });
  }
});

app.post('/api/user/deleteAccount', async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if the user has any active loans in the Borrow table
    const activeLoan = await Borrow.findOne({ borrowerUserEmail: email });
    if (activeLoan) {
      return res.status(400).json({ error: 'Cannot delete user with active loans.' });
    }

    // Delete the user from the database
    const user = await User.findOneAndDelete({ userEmail: email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User account deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ error: 'Failed to delete user account.' });
  }
});

// Start server
const PORT = process.env.PORT || 9090;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));