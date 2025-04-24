import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Card, CardContent, Button, Radio, RadioGroup, FormControlLabel, TextField } from '@mui/material';
import axios from 'axios';
import { useSession } from '../SessionContext'; // Import the session context
import { Link } from 'react-router-dom'; // Import Link for navigation

export default function BorrowPage() {
  const { session } = useSession(); // Access the session
  const userEmail = session?.user?.email; // Retrieve the logged-in user's email

  interface Lender {
    _id: string;
    contractId: string;
    userEmail: string;
    interestRate?: number;
    minBorrowAmount?: number;
    durationDays?: number;
    currentBalance?: number;
  }

  const [lenders, setLenders] = React.useState<Lender[]>([]);
  const [selectedLender, setSelectedLender] = React.useState<string | null>(null);
  const [borrowAmount, setBorrowAmount] = React.useState<number | ''>('');
  const [pendingAmount, setPendingAmount] = React.useState<number | ''>('');
  const [ethereumNetwork, setEthereumNetwork] = React.useState('');
  const [accountAddress, setAccountAddress] = React.useState('');
  const [collateralAmount, setCollateralAmount] = React.useState<number | ''>('');
  const [walletError, setWalletError] = React.useState<string | null>(null);
  const [walletReady, setWalletReady] = React.useState<boolean>(false);
  const [hasExistingBorrow, setHasExistingBorrow] = React.useState<boolean>(false);

  // Fetch lenders from the database
  const fetchLenders = async () => {
    try {
      const response = await axios.get(import.meta.env.VITE_SERVER_URL + '/api/lenders'); // Backend endpoint to fetch lenders
      const allLenders = response.data;

      // Filter out lenders with the same email as the logged-in user
      const filteredLenders = allLenders.filter((lender: Lender) => lender.userEmail !== userEmail);

      setLenders(filteredLenders);
    } catch (error) {
      console.error('Error fetching lenders:', error);
      alert('Failed to fetch lenders. Please try again later.');
    }
  };

  // Check if wallet address and private key are set
  const checkWallet = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/user/wallet?email=${userEmail}`);
      const { walletAddress, privateKey } = response.data;

      if (!walletAddress || !privateKey) {
        setWalletError('Please set your wallet address and private key in the Wallet page.');
        setWalletReady(false);
      } else {
        setWalletError(null);
        setWalletReady(true);
      }
    } catch (error) {
      console.error('Error checking wallet details:', error);
      setWalletError('Failed to verify wallet details. Please try again later.');
      setWalletReady(false);
    }
  };

  React.useEffect(() => {
    fetchLenders();
    if (userEmail) {
      checkWallet();
    }
  }, [userEmail]);

  const handleSelectLender = async (lenderId: string, lenderEmail: string) => {
    setSelectedLender(lenderId);

    try {
      const response = await axios.post(import.meta.env.VITE_SERVER_URL + '/api/searchBorrow', {
        borrowerUserEmail: userEmail, // Borrower's email
        lenderEmail: lenderEmail, // Lender's email
      });

      console.log('Response from /api/searchBorrow:', response.data);

      if (response.status === 200 && response.data.borrow) {
        const borrow = response.data.borrow;

        // If a matching borrow record is found, display borrowed and pending amounts
        setBorrowAmount(borrow.borrowAmount || '');
        setPendingAmount(borrow.pendingAmount || '');
        setHasExistingBorrow(true); // Indicate that an existing borrow record exists
      } else {
        // Clear the collateral box if no borrow record exists
        setEthereumNetwork('');
        setAccountAddress('');
        setCollateralAmount('');
              }
    } catch (error) {
      console.error('Error fetching borrow record:', error);
      alert('Failed to fetch borrow record.');
    }
  };

  const handleBorrow = async () => {
    if (!selectedLender || !borrowAmount || !collateralAmount || !ethereumNetwork || !accountAddress) {
      alert('Please fill in all fields and select a lender.');
      return;
    }

    try {
      const response = await axios.post(import.meta.env.VITE_SERVER_URL + '/api/borrow', {
        lenderEmail: lenders.find((lender) => lender._id === selectedLender)?.userEmail,
        borrowerUserEmail: userEmail,
        borrowAmount,
        pendingAmount: borrowAmount,
        lastTransactionDetails: `Borrowed ${borrowAmount} units`,
        collateral: {
          ethereumNetwork,
          accountAddress,
          collateralAmount,
        },
      });

      if (response.status === 201) {
        alert('Borrow request submitted successfully!');
        setBorrowAmount('');
        setCollateralAmount('');
        setEthereumNetwork('');
        setAccountAddress('');
      }
    } catch (error) {
      console.error('Error submitting borrow request:', error);
      alert('Failed to submit borrow request.');
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Available Lenders
      </Typography>
      {walletError && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {walletError}
        </Typography>
      )}
      <Grid container spacing={2}>
        {lenders.map((lender: any) => (
          <Grid item xs={12} sm={6} md={4} key={lender._id}>
            <Card sx={{ maxWidth: 345 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Interest Rate: {lender.interestRate ?? 'N/A'}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Amount: {lender.minBorrowAmount ?? 'N/A'} units
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Duration: {lender.durationDays ?? 'N/A'} days
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available Balance: {lender.currentBalance ?? 'N/A'} units
                </Typography>
                <RadioGroup
                  value={selectedLender}
                  onChange={(e) => handleSelectLender(e.target.value, lender.userEmail)}
                >
                  <FormControlLabel
                    value={lender._id}
                    control={<Radio />}
                    label="Select"
                    disabled={!walletReady} // Disable if wallet is not ready
                  />
                </RadioGroup>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {selectedLender && hasExistingBorrow && ( // Display existing borrow details if found
        <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
          <Typography variant="h6" gutterBottom>
            Existing Borrow Details
          </Typography>
          <Typography>
            Borrowed Amount: {borrowAmount} ETH
          </Typography>
          <Typography>
            Pending Amount: {pendingAmount} ETH
          </Typography>
          <Link to="/payments" style={{ textDecoration: 'none' }}>
            <Button variant="contained" color="primary" sx={{ mt: 2 }}>
              Go to Payments
            </Button>
          </Link>
        </Box>
      )}
      {selectedLender && !hasExistingBorrow && ( // Display borrow details box if no existing borrow record
        <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
          <Typography variant="h6" gutterBottom>
            Borrow Details
          </Typography>
          <Box sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
            <Typography variant="subtitle1" gutterBottom>
              Collateral
            </Typography>
            <TextField
              label="Ethereum Network"
              fullWidth
              margin="normal"
              value={ethereumNetwork}
              onChange={(e) => setEthereumNetwork(e.target.value)}
            />
            <TextField
              label="Account Address"
              fullWidth
              margin="normal"
              value={accountAddress}
              onChange={(e) => setAccountAddress(e.target.value)}
            />
            <TextField
              label="Collateral Amount (ETH)"
              type="number"
              fullWidth
              margin="normal"
              value={collateralAmount}
              onChange={(e) => setCollateralAmount(Number(e.target.value))}
            />
          </Box>
          <TextField
            label="Borrow Amount"
            type="number"
            fullWidth
            margin="normal"
            value={borrowAmount}
            onChange={(e) => setBorrowAmount(Number(e.target.value))}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleBorrow}
            disabled={!walletReady || !selectedLender}
          >
            Borrow
          </Button>
        </Box>
      )}
    </Box>
  );
}