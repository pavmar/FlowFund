require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ethers } = require('ethers'); // Import ethers.js
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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
    contractId,
    lenderEmail,
    borrowerUserEmail,
    borrowAmount,
    pendingAmount,
    lastTransactionDetails,
    collateral,
  } = req.body;

  try {
    if (
      !contractId ||
      !lenderEmail ||
      !borrowerUserEmail ||
      !borrowAmount ||
      !pendingAmount ||
      !collateral
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

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
      collateral,
    });

    await borrow.save();

    // Execute the borrow contract using Ethers.js
    const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL); // Local Ethereum network
    const signer = new ethers.Wallet(privateKey, provider); // Use the private key from the database

    console.log('Signer address:', signer.address);
    console.log('Contract ID:', contractId);

    // Load the contract
    const contractABI = [
      "function submitCollateral() public payable",
      "function borrow(uint256 amount) public",
      "function collateral(address account) public view returns (uint256)",
    ];
    const lendingContract = new ethers.Contract(contractId, contractABI, signer);

    console.log('Lending contract address:', lendingContract.address);

    const collateralAmountInWei = ethers.utils.parseEther(collateral.collateralAmount.toString()); // Convert collateral amount to Wei
    const borrowAmountInWei = ethers.utils.parseEther(borrowAmount.toString()); // Convert borrow amount to Wei

    // Borrower submits collateral
    await lendingContract.submitCollateral({ value: collateralAmountInWei });

    console.log("Collateral submitted successfully.", collateralAmountInWei.toString());

    // Borrower borrows ETH
    await lendingContract.borrow(borrowAmountInWei);

    // Check the contract's balance after borrowing
    const contractBalance = await provider.getBalance(lendingContract.address);
    console.log("Contract balance after borrowing:", ethers.utils.formatEther(contractBalance), "ETH");

    // // Check the borrower's collateral (handle default value)
    // const collateralBalance = await lendingContract.collateral(user.walletAddress);
    // if (collateralBalance.eq(0)) {
    //   console.log("No collateral found for the given address.");
    // } else {
    //   console.log("Borrower's collateral balance:", ethers.utils.formatEther(collateralBalance), "ETH");
    // }

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

// Start server
const PORT = process.env.PORT || 9090;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));