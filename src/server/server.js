require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ethers } = require('ethers'); // Import ethers.js
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

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
  lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
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
  lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lender'},
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

// Define the PastLoan schema (same as Borrow schema)
const pastLoanSchema = new mongoose.Schema({
  contractId: { type: String, required: true },
  lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lender' },
  lenderEmail: { type: String, required: true },
  borrowerUserEmail: { type: String, required: true },
  borrowAmount: { type: Number, required: true },
  borrowDate: { type: Date, default: Date.now },
  pendingAmount: { type: Number, required: true },
  lastTransactionDetails: { type: String, default: null },
  collateral: {
    ethereumNetwork: { type: String, required: true },
    accountAddress: { type: String, required: true },
    collateralAmount: { type: Number, required: true },
  },
});

const PastLoan = mongoose.model('PastLoan', pastLoanSchema);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FlowFund API',
      version: '1.0.0',
      description: 'API documentation for FlowFund',
    },
    servers: [
      {
        url: 'http://localhost:9090', // Replace with your server URL
      },
    ],
  },
  apis: ['./server.js'], // Ensure this path points to the file with Swagger comments
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
// api changes starts here

/**
 * @swagger
 * /api/auth/addUser:
 *   post:
 *     summary: Add a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               walletAddress:
 *                 type: string
 *                 example: 0x1234567890abcdef
 *               privateKey:
 *                 type: string
 *                 example: 0xabcdef1234567890
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Email is required
 *       500:
 *         description: Failed to register user
 */
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

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Login timestamp updated successfully
 *       400:
 *         description: Email is required
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to update login timestamp
 */
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

    // Load ABI and bytecode from LendingContract.json
    const contractPath = path.join(__dirname, '../../contract/artifacts/src/LendingContract.sol/LendingContract.json');
    const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    const { abi, bytecode } = contractJson;

    // Deploy a new LendingContract for the lender
    const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL); // Ensure this is set correctly
    const signer = new ethers.Wallet(user.privateKey, provider); // Use the lender's private key

    const contractFactory = new ethers.ContractFactory(abi, bytecode, signer);

    console.log("Deploying LendingContract...");
    const lendingContract = await contractFactory.deploy();
    await lendingContract.deployed();
    console.log("LendingContract deployed at:", lendingContract.address);

    const lenderContract = lendingContract.connect(signer);
    
    const lendAmount = ethers.utils.parseEther(minBorrowAmount.toString()); // Convert to Wei
    await lenderContract.lend({ value: lendAmount });
    console.log("Lender has lent:", ethers.utils.formatEther(lendAmount), "ETH");

    // Check the lender's balance in the contract
    const lenderBalance = await lendingContract.balances(signer.address);
    console.log("Lender balance in contract:", ethers.utils.formatEther(lenderBalance), "ETH");

    // Check the contract's balance after lending
    const contractBalance = await provider.getBalance(lendingContract.address); // Use the provider instance
    console.log("Contract balance after lending:", ethers.utils.formatEther(contractBalance), "ETH");

    // Check if the lender record already exists
    let lender = await Lender.findOne({ lenderId: user._id });
    if (lender) {
      // Update existing lender record
      lender.interestRate = interestRate;
      lender.durationDays = durationDays;
      lender.minBorrowAmount = minBorrowAmount;
      lender.userEmail = email; // Update the email field
      lender.contractId = lendingContract.address; // Assign the deployed contract address
      await lender.save();
    } else {
      // Create a new lender record
      lender = new Lender({
        contractId: lendingContract.address, // Assign the deployed contract address
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

/**
 * @swagger
 * /api/borrow:
 *   post:
 *     summary: Submit a borrow request
 *     tags: [Borrow]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contractId:
 *                 type: string
 *                 example: 0x1234567890abcdef
 *               lenderEmail:
 *                 type: string
 *                 example: lender@example.com
 *               borrowerUserEmail:
 *                 type: string
 *                 example: user@example.com
 *               borrowAmount:
 *                 type: number
 *                 example: 1000
 *               pendingAmount:
 *                 type: number
 *                 example: 1000
 *               lastTransactionDetails:
 *                 type: string
 *                 example: Borrowed 1000 units
 *               collateral:
 *                 type: object
 *                 properties:
 *                   ethereumNetwork:
 *                     type: string
 *                     example: mainnet
 *                   accountAddress:
 *                     type: string
 *                     example: 0xabcdef1234567890
 *                   collateralAmount:
 *                     type: number
 *                     example: 2
 *     responses:
 *       201:
 *         description: Borrow request submitted and contract executed successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Failed to process borrow request
 */
app.post('/api/borrow', async (req, res) => {
  const {
    lenderEmail,
    borrowerUserEmail,
    borrowAmount,
    pendingAmount,
    lastTransactionDetails,
    collateral, // Collateral details from the frontend
  } = req.body;

  try {
    if (
      !lenderEmail ||
      !borrowerUserEmail ||
      !borrowAmount ||
      !pendingAmount ||
      !collateral ||
      !collateral.ethereumNetwork ||
      !collateral.accountAddress ||
      !collateral.collateralAmount
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Retrieve the lender's contractId from the Lender database
    const lender = await Lender.findOne({ userEmail: lenderEmail });
    if (!lender) {
      return res.status(404).json({ error: 'Lender not found' });
    }

    const contractId = lender.contractId; // Get the contract ID from the lender record

    // Retrieve the private key from the User database
    const user = await User.findOne({ userEmail: borrowerUserEmail });
    if (!user || !user.privateKey) {
      return res.status(404).json({ error: 'User not found or private key is missing.' });
    }

    const privateKey = user.privateKey;

    // Save the borrow record in the database
    const borrow = new Borrow({
      contractId,
      lenderEmail,
      borrowerUserEmail,
      borrowAmount,
      pendingAmount,
      lastTransactionDetails,
      collateral, // Save the collateral details from the frontend
    });

    await borrow.save();

    // Load ABI from LendingContract.json
    const contractPath = path.join(__dirname, '../../contract/artifacts/src/LendingContract.sol/LendingContract.json');
    const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    const { abi } = contractJson;

    // Execute the borrow contract using Ethers.js
    const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL); // Local Ethereum network
    const signer = new ethers.Wallet(privateKey, provider); // Use the private key from the database

    console.log('Signer address:', signer.address);
    console.log('Contract ID:', contractId);

    // Load the contract
    const lendingContract = new ethers.Contract(contractId, abi, signer);

    console.log('Lending contract address:', lendingContract.address);

    const collateralAmountInWei = ethers.utils.parseEther(collateral.collateralAmount.toString()); // Convert collateral amount to Wei
    const borrowAmountInWei = ethers.utils.parseEther(borrowAmount.toString()); // Convert borrow amount to Wei

    // Borrower submits collateral
    const borrowerAddress = await signer.getAddress(); // Resolve the Promise to get the address
    console.log("Borrower address:", borrowerAddress);

    const borrowerContract = lendingContract.connect(signer); // Use the signer directly
    console.log("Submitting collateral:", collateralAmountInWei.toString(), "Wei");
    await borrowerContract.submitCollateral({ value: collateralAmountInWei });

    console.log("Collateral submitted successfully.", collateralAmountInWei.toString());

    // Borrower borrows ETH
    await borrowerContract.borrow(borrowAmountInWei);

    console.log("Borrow request executed successfully.");

    // Check the contract's balance after borrowing
    const contractBalance = await provider.getBalance(lendingContract.address);
    console.log("Contract balance after borrowing:", ethers.utils.formatEther(contractBalance), "ETH");

    res.status(201).json({
      message: 'Borrow request submitted and contract executed successfully.',
    });
  } catch (error) {
    console.error('Error processing borrow request:', error);
    res.status(500).json({ error: 'Failed to process borrow request.' });
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

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get payment details for a user
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: userEmail
 *         schema:
 *           type: string
 *         required: true
 *         description: Email of the user
 *     responses:
 *       200:
 *         description: Payment details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 borrowAmount:
 *                   type: number
 *                   example: 1000
 *                 pendingAmount:
 *                   type: number
 *                   example: 500
 *                 interest:
 *                   type: number
 *                   example: 50
 *                 totalAmountDue:
 *                   type: number
 *                   example: 550
 *                 borrowDate:
 *                   type: string
 *                   example: 2023-01-01T00:00:00.000Z
 *                 lenderEmail:
 *                   type: string
 *                   example: lender@example.com
 *       400:
 *         description: User email is required
 *       404:
 *         description: No pending loans found for this user
 *       500:
 *         description: Failed to fetch payment details
 */
app.get('/api/payments', async (req, res) => {
  const { userEmail } = req.query;

  try {
    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }

    // Fetch the borrow record for the user
    const borrow = await Borrow.findOne({ borrowerUserEmail: userEmail, pendingAmount: { $gt: 0 } });
    if (!borrow) {
      return res.status(404).json({ error: 'No pending loans found for this user.' });
    }

    // Fetch the lender details to get the interest rate
    const lender = await Lender.findOne({ userEmail: borrow.lenderEmail });
    if (!lender) {
      return res.status(404).json({ error: 'Lender not found for this loan.' });
    }

    // Calculate interest
    const borrowDate = new Date(borrow.borrowDate);
    const currentDate = new Date();
    const daysElapsed = Math.ceil((currentDate - borrowDate) / (1000 * 60 * 60 * 24)); // Days between dates
    const interest = (borrow.borrowAmount * lender.interestRate * daysElapsed) / 36500; // Simple interest formula

    res.status(200).json({
      borrowAmount: borrow.borrowAmount,
      pendingAmount: borrow.pendingAmount,
      interest,
      totalAmountDue: borrow.pendingAmount + interest,
      borrowDate,
      lenderEmail: borrow.lenderEmail,
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ error: 'Failed to fetch payment details.' });
  }
});

app.get('/api/user/wallet', async (req, res) => {
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
    console.error('Error fetching wallet details:', error);
    res.status(500).json({ error: 'Failed to fetch wallet details' });
  }
});

/**
 * @swagger
 * /api/repay:
 *   post:
 *     summary: Repay a portion of the borrowed ETH
 *     tags: [Repay]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               borrowerUserEmail:
 *                 type: string
 *                 example: user@example.com
 *               repayAmount:
 *                 type: number
 *                 example: 0.5
 *     responses:
 *       200:
 *         description: Repayment processed successfully
 *       400:
 *         description: Missing required fields or invalid repayment amount
 *       404:
 *         description: Borrow record not found
 *       500:
 *         description: Failed to process repayment
 */
app.post('/api/repay', async (req, res) => {
  const { borrowerUserEmail, repayAmount } = req.body;

  try {
    if (!borrowerUserEmail || !repayAmount || repayAmount <= 0) {
      return res.status(400).json({ error: 'Invalid borrower email or repayment amount' });
    }

    // Fetch the borrow record for the user
    const borrow = await Borrow.findOne({ borrowerUserEmail, pendingAmount: { $gt: 0 } });
    if (!borrow) {
      return res.status(404).json({ error: 'No active borrow record found for this user' });
    }

    // Fetch the lender's contract ID
    const lender = await Lender.findOne({ userEmail: borrow.lenderEmail });
    if (!lender) {
      return res.status(404).json({ error: 'Lender not found for this loan' });
    }

    const contractId = lender.contractId;

    // Retrieve the borrower's private key
    const user = await User.findOne({ userEmail: borrowerUserEmail });
    if (!user || !user.privateKey) {
      return res.status(404).json({ error: 'User not found or private key is missing' });
    }

    const privateKey = user.privateKey;

    // Load ABI from LendingContract.json
    const contractPath = path.join(__dirname, '../../contract/artifacts/src/LendingContract.sol/LendingContract.json');
    const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    const { abi } = contractJson;

    // Interact with the smart contract
    const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    const signer = new ethers.Wallet(privateKey, provider);
    const lendingContract = new ethers.Contract(contractId, abi, signer);

    const repayAmountInWei = ethers.utils.parseEther(repayAmount.toString()); // Convert to Wei

    console.log('Processing repayment:', repayAmountInWei.toString(), 'Wei');
    await lendingContract.repay({ value: repayAmountInWei });

    console.log('Repayment processed successfully.');

    // Update the borrow record in the database
    borrow.pendingAmount -= repayAmount;
    if (borrow.pendingAmount <= 0) {
      // Save the borrow record to the PastLoan collection
      const pastLoan = new PastLoan(borrow.toObject());
      await pastLoan.save();
      console.log('Borrow record moved to PastLoan collection.');

      // Delete the borrow record
      await Borrow.deleteOne({ _id: borrow._id });
      console.log('Borrow record deleted as pending amount is zero.');
    } else {
      await borrow.save();
    }

    res.status(200).json({
      message: 'Repayment processed successfully',
      updatedPendingAmount: borrow.pendingAmount > 0 ? borrow.pendingAmount : 0,
    });
  } catch (error) {
    console.error('Error processing repayment:', error);
    res.status(500).json({ error: 'Failed to process repayment' });
  }
});

app.get('/api/borrowers/count', async (req, res) => {
  try {
    const count = await Borrow.countDocuments({ pendingAmount: { $gt: 0 } });
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching borrowers count:', error);
    res.status(500).json({ error: 'Failed to fetch borrowers count' });
  }
});

app.get('/api/lenders/count', async (req, res) => {
  try {
    const count = await Lender.countDocuments({});
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching lenders count:', error);
    res.status(500).json({ error: 'Failed to fetch lenders count' });
  }
});

app.get('/api/pastLoans/count', async (req, res) => {
  try {
    const count = await PastLoan.countDocuments({});
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching past loans count:', error);
    res.status(500).json({ error: 'Failed to fetch past loans count' });
  }
});

// Start server
const PORT = process.env.PORT || 9090;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));