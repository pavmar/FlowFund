import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Card, CardContent, Button, Radio, RadioGroup, FormControlLabel, TextField } from '@mui/material';
import axios from 'axios';
import { useSession } from '../SessionContext'; // Import the session context

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
  const [ethereumNetwork, setEthereumNetwork] = React.useState('');
  const [accountAddress, setAccountAddress] = React.useState('');
  const [collateralAmount, setCollateralAmount] = React.useState<number | ''>('');
  const [collateralAddress, setCollateralAddress] = React.useState<string | ''>('');
  const [pendingAmount, setPendingAmount] = React.useState<number | null>(null);
  const [borrowError, setBorrowError] = React.useState<string | null>(null);
  const [isEditingCollateral, setIsEditingCollateral] = React.useState(false);
  const [collateralError, setCollateralError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Fetch lenders from the database
  const fetchLenders = async () => {
    try {
      const response = await axios.get('http://localhost:9090/api/lenders'); // Backend endpoint to fetch lenders
      const allLenders = response.data;

      // Filter out lenders with the same email as the logged-in user
      const filteredLenders = allLenders.filter((lender: Lender) => lender.userEmail !== userEmail);

      setLenders(filteredLenders);
    } catch (error) {
      console.error('Error fetching lenders:', error);
      alert('Failed to fetch lenders. Please try again later.');
    }
  };

  React.useEffect(() => {
    fetchLenders();
  }, []);

  const handleSelectLender = async (lenderId: string, lenderEmail: string) => {
    setSelectedLender(lenderId);

    try {
      const response = await axios.post('http://localhost:9090/api/searchBorrow', {
        borrowerUserEmail: userEmail, // Borrower's email
        lenderEmail: lenderEmail, // Lender's email
      });

      if (response.status === 200 && response.data.borrow) {
        const borrow = response.data.borrow;

        // Preload the collateral box with details from the database
        setPendingAmount(borrow.pendingAmount);
        setEthereumNetwork(borrow.collateral.ethereumNetwork || '');
        setAccountAddress(borrow.collateral.accountAddress || '');
        setCollateralAmount(borrow.collateral.collateralAmount || '');
      } else {
        // Clear the collateral box if no borrow record exists
        setPendingAmount(null);
        setEthereumNetwork('');
        setAccountAddress('');
        setCollateralAmount('');
      }
    } catch (error) {
      console.error('Error fetching borrow record:', error);
      alert('Failed to fetch borrow record.');
    }
  };

  const handleRepay = async () => {
    if (!selectedLender || !pendingAmount || pendingAmount <= 0) {
      alert('No pending amount to repay.');
      return;
    }

    try {
      // Add logic to handle repayment
      alert('Repayment functionality is not implemented yet.');
    } catch (error) {
      console.error('Error processing repayment:', error);
      alert('Failed to process repayment.');
    }
  };

  const handleSubmit = async () => {
    if (!selectedLender) {
      setBorrowError('No lender selected.');
      return;
    }

    const lenderDetails = lenders.find((lender: any) => lender._id === selectedLender);
    if (!lenderDetails) {
      setBorrowError('Selected lender details not found.');
      return;
    }

    if (!ethereumNetwork || !accountAddress || !collateralAmount || collateralAmount <= 0) {
      setBorrowError('Please provide valid collateral details.');
      return;
    }

    if (!borrowAmount || borrowAmount <= 0) {
      setBorrowError('Please enter a valid borrow amount.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:9090/api/borrow', {
        contractId: lenderDetails.contractId, // Pass the contract ID of the lender
        lenderEmail: lenderDetails.userEmail, // Pass the lender's email
        borrowerUserEmail: userEmail, // Borrower's email
        borrowAmount, // Borrow amount entered by the user
        pendingAmount: borrowAmount, // Initially, pending amount is the same as borrow amount
        lastTransactionDetails: `Borrowed ${borrowAmount} units`, // Transaction details
        collateral: {
          ethereumNetwork,
          accountAddress,
          collateralAmount,
        }, // Collateral details
      });

      if (response.status === 201) {
        alert(`Borrow request submitted successfully! Transaction Hash: ${response.data.transactionHash}`);
        setBorrowAmount('');
        setEthereumNetwork('');
        setAccountAddress('');
        setCollateralAmount('');
        setSelectedLender(null);
      }
    } catch (error) {
      console.error('Error submitting borrow request:', error);
      setBorrowError('Failed to submit borrow request.');
    }
  };

  const handleSaveCollateral = async () => {
    if (!collateralAddress || !collateralAmount || collateralAmount <= 0) {
      setCollateralError('Please provide valid collateral details.');
      return;
    }

    try {
      // Add logic to save collateral details
      setSuccessMessage('Collateral details saved successfully!');
      setCollateralError(null);
      setIsEditingCollateral(false);
    } catch (error) {
      console.error('Error saving collateral details:', error);
      setCollateralError('Failed to save collateral details.');
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>

      <Typography variant="h4" gutterBottom>
        Available Lenders
      </Typography>
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
                  />
                </RadioGroup>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {selectedLender && (
        <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: 4 }}>
          <Typography variant="h6" gutterBottom>
            Collateral and Borrow Details
          </Typography>
          <TextField
            id="ethereumNetwork"
            label="Ethereum Network"
            variant="outlined"
            fullWidth
            value={ethereumNetwork}
            onChange={(e) => setEthereumNetwork(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            id="accountAddress"
            label="Account Address"
            variant="outlined"
            fullWidth
            value={accountAddress}
            onChange={(e) => setAccountAddress(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            id="collateralAmount"
            label="Collateral Amount"
            type="number"
            variant="outlined"
            fullWidth
            value={collateralAmount}
            onChange={(e) => setCollateralAmount(Number(e.target.value))}
            sx={{ mb: 2 }}
          />
          <TextField
            id="borrowAmount"
            label="Borrow Amount"
            type="number"
            variant="outlined"
            fullWidth
            value={borrowAmount}
            onChange={(e) => setBorrowAmount(Number(e.target.value))}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={
              !ethereumNetwork ||
              !accountAddress ||
              !collateralAmount ||
              collateralAmount <= 0 ||
              !borrowAmount ||
              borrowAmount <= 0
            }
          >
            Submit
          </Button>
        </Box>
      )}
    </Box>
  );
}