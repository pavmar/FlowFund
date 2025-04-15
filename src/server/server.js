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
  userId: { type: String, unique: true }, // Unique user identifier (optional for now)
  fullName: { type: String }, // Full name of the user (optional)
  email: { type: String, required: true, unique: true }, // Email address (required)
  walletAddress: { type: String }, // Public wallet address (optional)
  walletBalance: { type: Number, default: 0 }, // Wallet balance in platform's base currency (optional)
  isLender: { type: Boolean, default: false }, // Whether the user is a lender (optional)
  isBorrower: { type: Boolean, default: false }, // Whether the user is a borrower (optional)
  loginActivity: { type: [Date], default: [] }, // Array of login timestamps for engagement tracking (optional)
});


const User = mongoose.model('User', userSchema);


// Lender Schema and Model
const lenderSchema = new mongoose.Schema({
  lenderEmail: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User schema by ObjectId
  lendingTerms: {
    interestRate: { type: Number, required: true }, // e.g., 5%
    durationDays: { type: Number, required: true }, // e.g., 90 days
    minBorrowAmount: { type: Number, required: true }, // Minimum borrow amount
  },
  activeLoans: { type: [String], default: [] }, // Array of Loan IDs
  totalInterestEarned: { type: Number, default: 0 }, // Total interest earned
  expectedInterest: { type: Number, default: 0 }, // Expected interest from ongoing loans
  dateJoined: { type: Date, default: Date.now }, // Date the lender joined
});


const Lender = mongoose.model('Lender', lenderSchema);

// Borrower Schema and Model

const borrowerSchema = new mongoose.Schema({
  borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User schema
  creditRating: { type: Number, default: 0 }, // Borrower's credit rating
  collateralValue: { type: Number, default: 0 }, // Value of collateral provided by the borrower
  onTimePayments: { type: Number, default: 0 }, // Number of on-time payments made by the borrower
  totalLogins: { type: Number, default: 0 }, // Total number of logins by the borrower
  loanHistory: [
    {
      loanId: { type: String, required: true }, // Unique loan ID
      amount: { type: Number, required: true }, // Loan amount
      interestRate: { type: Number, required: true }, // Interest rate
      tenureDays: { type: Number, required: true }, // Loan duration in days
      collateralValue: { type: Number, required: true }, // Collateral value for the loan
    },
  ],
});


const Borrower = mongoose.model('Borrower', borrowerSchema);


//Loan Schema

const loanSchema = new mongoose.Schema({
  loanId: { type: String, required: true, unique: true }, // Unique loan identifier
  lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to lender's userId
  borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to borrower's userId
  amount: { type: Number, required: true }, // Loan amount
  interestRate: { type: Number, required: true }, // Interest rate
  interestPaidSoFar: { type: Number, default: 0 }, // Interest paid so far
  startDate: { type: Date, default: Date.now }, // Loan start date
  endDate: { type: Date, required: true }, // Loan end date
  nextPaymentDue: { type: Date, required: true }, // Next payment due date
  paymentDueAmount: { type: Number, required: true }, // Amount due for the next payment
  isPreclosed: { type: Boolean, default: false }, // Whether the loan is preclosed
  isActive: { type: Boolean, default: true }, // Whether the loan is active
  tenureDays: { type: Number, required: true }, // Loan tenure in days
  collateralHeld: { type: Number, required: true }, // Collateral held for the loan
});

const Loan = mongoose.model('Loan', loanSchema);

app.get('/api/lenders', async (req, res) => {
  try {
    console.log('Fetching lenders from the database...');
    const lenders = await Lender.find()
      .populate({
        path: 'lenderEmail', // Reference the User schema
        select: 'email', // Only fetch the email field from the User schema
      })
      .select('lendingTerms activeLoans totalInterestEarned expectedInterest dateJoined'); // Select specific fields from the Lender schema

    console.log('Lenders fetched successfully:', lenders);
    res.status(200).json(lenders);
  } catch (error) {
    console.error('Error fetching lenders:', error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to fetch lenders' });
  }
});



const { v4: uuidv4 } = require('uuid'); // Import UUID for generating unique user IDs

app.post('/api/auth/addUser', async (req, res) => {
  const { email, fullName, walletAddress } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if the user already exists in the database
    let user = await User.findOne({ email });

    if (!user) {
      // If user does not exist, create a new user
      user = new User({
        userId: uuidv4(), // Generate a unique user ID
        fullName: fullName || '', // Optional field
        email,
        walletAddress: walletAddress || '', // Optional field
        walletBalance: 1000, // Default wallet balance
        isLender: false, // Default value
        isBorrower: false, // Default value
        loginActivity: [new Date()], // Add the current timestamp to loginActivity
      });
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


app.post('/api/auth/login', async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add the current timestamp to the loginActivity array
    user.loginActivity.push(new Date());
    await user.save();

    res.status(200).json({ message: 'Login activity updated successfully', user });
  } catch (error) {
    console.error('Error updating login activity:', error);
    res.status(500).json({ error: 'Failed to update login activity' });
  }
});


app.post('/api/borrower/createOrUpdate', async (req, res) => {
  const { userId, creditRating, collateralValue, onTimePayments, loanId } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Find the borrower by userId
    let borrower = await Borrower.findOne({ borrowerId: userId });

    if (!borrower) {
      // If borrower does not exist, create a new borrower
      borrower = new Borrower({
        borrowerId: userId,
        creditRating: creditRating || 0,
        collateralValue: collateralValue || 0,
        onTimePayments: onTimePayments || 0,
        totalLogins: 1, // Initialize with 1 login
        loanHistory: loanId ? [loanId] : [],
      });
    } else {
      // Update existing borrower details
      if (creditRating !== undefined) borrower.creditRating = creditRating;
      if (collateralValue !== undefined) borrower.collateralValue = collateralValue;
      if (onTimePayments !== undefined) borrower.onTimePayments += onTimePayments;
      if (loanId) borrower.loanHistory.push(loanId);
      borrower.totalLogins += 1; // Increment total logins
    }

    await borrower.save();
    res.status(200).json({ message: 'Borrower details updated successfully', borrower });
  } catch (error) {
    console.error('Error updating borrower details:', error);
    res.status(500).json({ error: 'Failed to update borrower details' });
  }
});

//  create or update a lender's details when they activate their account as a lende
app.post('/api/lender/activate', async (req, res) => {
  const { email, interestRate, durationDays, minBorrowAmount } = req.body;

  try {
    if (!email || !interestRate || !durationDays || !minBorrowAmount) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user's wallet balance is sufficient
    if (user.walletBalance < minBorrowAmount) {
      return res.status(400).json({ error: 'Insufficient wallet balance to lend' });
    }

    // Check if the user is already a lender
    let lender = await Lender.findOne({ lenderEmail: email });

    if (!lender) {
      // Create a new lender
      lender = new Lender({
        lenderEmail: email,
        lendingTerms: {
          interestRate,
          durationDays,
          minBorrowAmount,
        },
        activeLoans: [],
        totalInterestEarned: 0,
        expectedInterest: 0,
        dateJoined: new Date(),
      });
      user.isLender = true; // Mark the user as a lender
      await user.save();
    } else {
      // Update existing lender details
      lender.lendingTerms = {
        interestRate,
        durationDays,
        minBorrowAmount,
      };
    }

    await lender.save();
    res.status(200).json({ message: 'Lender activated successfully', lender });
  } catch (error) {
    console.error('Error activating lender:', error);
    res.status(500).json({ error: 'Failed to activate lender' });
  }
});


app.get('/api/auth/getUserByEmail', async (req, res) => {
  const { email } = req.query;

  try {
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ userId: user._id });
  } catch (error) {
    console.error('Error fetching user by email:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});


//borrow endpoints

app.post('/api/borrow', async (req, res) => {
  const { lenderId, borrowerEmail, amount, interestRate, tenureDays, collateralValue } = req.body;

  try {
    console.log('Borrow request received:', req.body);

    // Fetch borrower by email
    const borrower = await User.findOne({ email: borrowerEmail });
    if (!borrower) {
      console.error('Borrower not found');
      return res.status(404).json({ error: 'Borrower not found' });
    }
    console.log('Borrower found:', borrower);

    const borrowerId = borrower._id;

    // Check if the borrower already exists in the Borrower schema
    let borrowerDetails = await Borrower.findOne({ borrowerId });
    if (!borrowerDetails) {
      // Create a new borrower entry
      borrowerDetails = new Borrower({
        borrowerId,
        collateralValue,
        loanHistory: [], // Initialize loan history
      });
      console.log('New borrower created:', borrowerDetails);
    }

    // Add the borrow request details to the loan history
    const loanId = `loan_${Date.now()}`;
    borrowerDetails.loanHistory.push({
      loanId,
      amount,
      interestRate,
      tenureDays,
      collateralValue,
    });
    console.log('Loan details added to borrower:', borrowerDetails);

    // Save the updated borrower details
    await borrowerDetails.save();
    console.log('Borrower details updated and saved:', borrowerDetails);

    // Respond with a success message
    res.status(200).json({
      message: 'Borrow request processed successfully',
      borrowerDetails,
    });
  } catch (error) {
    console.error('Error processing borrow request:', error);
    res.status(500).json({ error: 'Failed to process borrow request' });
  }
});

// Start server
const PORT = process.env.PORT || 9090;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));