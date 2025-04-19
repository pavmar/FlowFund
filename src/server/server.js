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
  borrowerUserEmail: { type: String, required: true }, // Store the borrower's email
  borrowAmount: { type: Number, required: true },
  borrowDate: { type: Date, default: Date.now },
  pendingAmount: { type: Number, required: true },
  lastTransactionDetails: { type: String, default: null },
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
//       lendingAmount: minBorrowAmount,
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
        lendingAmount: 0,
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



// app.post('/api/borrow', async (req, res) => {
//   const { contractId, lenderId, borrowAmount, pendingAmount, lastTransactionDetails } = req.body;

//   // Log the incoming request body
//   console.log('Borrow request initiated');
//   console.log('Request body received:', req.body);

//   try {
//     // Validate required fields
//     if (!contractId || !lenderId || !borrowAmount || !pendingAmount) {
//       console.error('Validation failed: Missing required fields');
//       return res.status(400).json({ error: 'All fields are required' });
//     }

//     // Log the validation success
//     console.log('Validation successful');

//     // Create a new Borrow record
//     const borrow = new Borrow({
//       contractId,
//       lenderId,
//       borrowAmount,
//       pendingAmount,
//       lastTransactionDetails,
//     });

//     // Log the Borrow object before saving
//     console.log('Borrow object to be saved:', borrow);

//     // Save the Borrow record to the database
//     await borrow.save();

//     // Log the success message after saving
//     console.log('Borrow record saved successfully:', borrow);

//     res.status(201).json({ message: 'Borrow request created successfully', borrow });
//   } catch (error) {
//     // Log the error details
//     console.error('Error creating borrow request:', error.stack || error.message || error);
//     res.status(500).json({ error: 'Failed to create borrow request' });
//   }
// });
app.post('/api/borrow', async (req, res) => {
  const { contractId, lenderId, borrowerUserEmail, borrowAmount, pendingAmount, lastTransactionDetails } = req.body;

  // Log the incoming request body
  console.log('Borrow request initiated');
  console.log('Request body received:', req.body);

  try {
    // Validate required fields
    if (!contractId || !lenderId || !borrowerUserEmail || !borrowAmount || !pendingAmount) {
      console.error('Validation failed: Missing required fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Log the validation success
    console.log('Validation successful');

    // Find the user by borrowerUserEmail
    const user = await User.findOne({ userEmail: borrowerUserEmail });
    if (!user) {
      console.error('Borrower not found with email:', borrowerUserEmail);
      return res.status(404).json({ error: 'Borrower not found' });
    }

    // Update the isBorrower field to true
    if (!user.isBorrower) {
      user.isBorrower = true;
      await user.save();
      console.log('User updated to borrower:', user);
    }

    // Find the lender by lenderId (not _id)
    const lender = await Lender.findOne({ lenderId });
    if (!lender) {
      console.error('Lender not found with lenderId:', lenderId);
      return res.status(404).json({ error: 'Lender not found' });
    }

    // Update the lender's currentBalance and lendingAmount
    if (lender.currentBalance < borrowAmount) {
      console.error('Borrow amount exceeds lender\'s current balance');
      return res.status(400).json({ error: 'Borrow amount exceeds lender\'s current balance' });
    }

    lender.currentBalance -= borrowAmount; // Decrease current balance
    lender.lendingAmount += borrowAmount; // Increase lending amount
    await lender.save();
    console.log('Lender updated successfully:', lender);

    // Create a new Borrow record
    const borrow = new Borrow({
      contractId,
      lenderId: lender._id, // Use the _id of the lender document
      borrowerUserEmail, // Save the borrower's email
      borrowAmount,
      pendingAmount,
      lastTransactionDetails,
    });

    // Log the Borrow object before saving
    console.log('Borrow object to be saved:', borrow);

    // Save the Borrow record to the database
    await borrow.save();

    // Log the success message after saving
    console.log('Borrow record saved successfully:', borrow);

    res.status(201).json({ message: 'Borrow request created successfully', borrow });
  } catch (error) {
    // Log the error details
    console.error('Error creating borrow request:', error.stack || error.message || error);
    res.status(500).json({ error: 'Failed to create borrow request' });
  }
});


// app.post('/api/user/updateCollateral', async (req, res) => {
//   const { email, collateralAddress, collateralAmount } = req.body;

//   try {
//     if (!email) {
//       return res.status(400).json({ error: 'Email is required' });
//     }

//     // Find the user by email
//     const user = await User.findOne({ userEmail: email });
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Update collateral details
//     user.collateralAddress = collateralAddress || user.collateralAddress;
//     user.collateralAmount = collateralAmount || user.collateralAmount;
//     await user.save();

//     console.log('User collateral updated:', user);
//     res.status(200).json({ message: 'Collateral updated successfully', user });
//   } catch (error) {
//     console.error('Error updating collateral:', error);
//     res.status(500).json({ error: 'Failed to update collateral' });
//   }
// });

app.post('/api/user/updateCollateral', async (req, res) => {
  const { email, collateralAddress, collateralAmount } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find the user by email
    const user = await User.findOne({ userEmail: email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update collateral details
    user.collateralAddress = collateralAddress || user.collateralAddress;
    user.collateralAmount = collateralAmount || user.collateralAmount;
    await user.save();

    console.log('User collateral updated:', user);
    res.status(200).json({ message: 'Collateral updated successfully', user });
  } catch (error) {
    console.error('Error updating collateral:', error);
    res.status(500).json({ error: 'Failed to update collateral' });
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
      collateralAddress: user.collateralAddress,
      collateralAmount: user.collateralAmount,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Start server
const PORT = process.env.PORT || 9090;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));