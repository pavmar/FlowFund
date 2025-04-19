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

  const [lenders, setLenders] = React.useState([]);
  const [selectedLender, setSelectedLender] = React.useState<string | null>(null);
  const [borrowAmount, setBorrowAmount] = React.useState<number | ''>('');
  const [showBorrowForm, setShowBorrowForm] = React.useState(false);
  const [collateralAddress, setCollateralAddress] = React.useState<string | null>(null);
  const [collateralAmount, setCollateralAmount] = React.useState<number | null>(null);
  const [isEditingCollateral, setIsEditingCollateral] = React.useState(false);
  const [collateralError, setCollateralError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [borrowError, setBorrowError] = React.useState(''); // Error message for borrow amount
  const [lenderValidationError, setLenderValidationError] = React.useState(''); // Error for lender's available balance validation

  // Fetch user collateral details
  React.useEffect(() => {
    const fetchCollateralDetails = async () => {
      try {
        const response = await axios.get('http://localhost:9090/api/user/details', {
          params: { email: userEmail },
        });
        setCollateralAddress(response.data.collateralAddress);
        setCollateralAmount(response.data.collateralAmount);
      } catch (error) {
        console.error('Error fetching collateral details:', error);
        alert('Failed to fetch collateral details. Please try again later.');
      }
    };

    if (userEmail) {
      fetchCollateralDetails();
    }
  }, [userEmail]);

  // Fetch lenders from the database
  const fetchLenders = async () => {
    try {
      const response = await axios.get('http://localhost:9090/api/lenders'); // Backend endpoint to fetch lenders
      setLenders(response.data);
    } catch (error) {
      console.error('Error fetching lenders:', error);
      alert('Failed to fetch lenders. Please try again later.');
    }
  };

  React.useEffect(() => {
    fetchLenders();
  }, []);

  const handleSaveCollateral = async () => {
    if (!collateralAddress || !collateralAmount) {
      setCollateralError('Both collateral address and amount are required');
      setSuccessMessage('');
      return;
    }

    try {
      setCollateralError('');
      const response = await axios.post('http://localhost:9090/api/user/updateCollateral', {
        email: userEmail, // Use email from session context
        collateralAddress,
        collateralAmount: parseFloat(collateralAmount as any), // Ensure amount is a number
      });

      if (response.status === 200) {
        setSuccessMessage('Collateral updated successfully');
        console.log('Collateral updated:', response.data);
        setIsEditingCollateral(false); // Exit editing mode
        setCollateralAddress(response.data.user.collateralAddress);
        setCollateralAmount(response.data.user.collateralAmount);
      }
    } catch (error) {
      console.error('Error updating collateral:', error);
      setCollateralError('Failed to update collateral. Please try again.');
    }
  };

  const handleSelectLender = (lenderId: string) => {
    setSelectedLender(lenderId);
    setShowBorrowForm(true); // Show the borrow form when a lender is selected
    const selectedLenderDetails = lenders.find((lender: any) => lender._id === lenderId);

    // Reset validation errors when a new lender is selected
    setBorrowError('');
    setLenderValidationError('');

    console.log('Selected Lender Details:', selectedLenderDetails);
  };

  const handleBorrowSubmit = async () => {
    if (!selectedLender) {
      setBorrowError('No lender selected.');
      return;
    }

    const lenderDetails = lenders.find((lender: any) => lender._id === selectedLender);
    if (!lenderDetails) {
      setBorrowError('Selected lender details not found.');
      return;
    }

    if (borrowAmount > lenderDetails.currentBalance) {
      setLenderValidationError('Borrow amount cannot exceed the selected lender\'s available balance.');
      return;
    }

    if (collateralAmount && borrowAmount > collateralAmount / 2) {
      setBorrowError('Borrow amount cannot exceed half of your collateral amount.');
      return;
    }

    console.log('Lender Details:', lenderDetails);
    console.log('User Details:', session?.user?.email);

    try {
      const response = await axios.post('http://localhost:9090/api/borrow', {
        contractId: lenderDetails.contractId, // Contract ID of the lender
        lenderId: lenderDetails.lenderId, // Lender ID to be sent to the backend
        borrowerUserEmail: session?.user?.email, // Borrower ID fetched from session
        borrowAmount, // Borrow amount entered by the user
        pendingAmount: borrowAmount, // Initially, pending amount is the same as borrow amount
        lastTransactionDetails: `Borrowed ${borrowAmount} units`, // Transaction details
      });

      if (response.status === 201) {
        alert('Borrow request submitted successfully!');
        setBorrowAmount(''); // Clear the borrow amount after submission
        setShowBorrowForm(false); // Hide the borrow form after submission
        setBorrowError(''); // Clear any previous error
        setLenderValidationError(''); // Clear lender validation error
        fetchLenders(); // Refetch the list of lenders
      }
    } catch (error) {
      console.error('Error submitting borrow request:', error);
      setBorrowError('Failed to submit borrow request.');
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Collateral Details
      </Typography>
      {collateralAddress && collateralAmount ? (
        <Box sx={{ mb: 4 }}>
          {!isEditingCollateral ? (
            <>
              <Typography variant="body1">
                Collateral Address: {collateralAddress}
              </Typography>
              <Typography variant="body1">
                Collateral Amount: {collateralAmount} units
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setIsEditingCollateral(true)}
                sx={{ mt: 2 }}
              >
                Update Collateral Details
              </Button>
            </>
          ) : (
            <>
              <TextField
                label="Collateral Address"
                fullWidth
                margin="normal"
                value={collateralAddress || ''}
                onChange={(e) => setCollateralAddress(e.target.value)}
              />
              <TextField
                label="Collateral Amount"
                type="number"
                fullWidth
                margin="normal"
                value={collateralAmount || ''}
                onChange={(e) => setCollateralAmount(Number(e.target.value))}
              />
              {collateralError && (
                <Typography variant="body2" color="error">
                  {collateralError}
                </Typography>
              )}
              {successMessage && (
                <Typography variant="body2" color="success">
                  {successMessage}
                </Typography>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveCollateral}
                sx={{ mt: 2 }}
              >
                Save Collateral
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setIsEditingCollateral(false)}
                sx={{ mt: 2, ml: 2 }}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      ) : (
        <Box sx={{ mb: 4 }}>
          {!isEditingCollateral ? (
            <>
              <Typography variant="body1" color="error">
                No collateral details found.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setIsEditingCollateral(true)}
                sx={{ mt: 2 }}
              >
                Add Collateral Details
              </Button>
            </>
          ) : (
            <>
              <TextField
                label="Collateral Address"
                fullWidth
                margin="normal"
                value={collateralAddress || ''}
                onChange={(e) => setCollateralAddress(e.target.value)}
              />
              <TextField
                label="Collateral Amount"
                type="number"
                fullWidth
                margin="normal"
                value={collateralAmount || ''}
                onChange={(e) => setCollateralAmount(Number(e.target.value))}
              />
              {collateralError && (
                <Typography variant="body2" color="error">
                  {collateralError}
                </Typography>
              )}
              {successMessage && (
                <Typography variant="body2" color="success">
                  {successMessage}
                </Typography>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveCollateral}
                sx={{ mt: 2 }}
              >
                Save Collateral
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setIsEditingCollateral(false)}
                sx={{ mt: 2, ml: 2 }}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      )}

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
                  onChange={(e) => handleSelectLender(e.target.value)}
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
      {showBorrowForm && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Enter Borrow Amount
          </Typography>
          <TextField
            id="borrowAmount"
            label="Borrow Amount"
            type="number"
            variant="outlined"
            value={borrowAmount}
            onChange={(e) => {
              const value = Number(e.target.value);
              setBorrowAmount(value);

              const lenderDetails = lenders.find((lender: any) => lender._id === selectedLender);

              if (lenderDetails && value > lenderDetails.currentBalance) {
                setLenderValidationError('Borrow amount cannot exceed the selected lender\'s available balance.');
              } else {
                setLenderValidationError('');
              }

              if (collateralAmount && value > collateralAmount / 2) {
                setBorrowError('Borrow amount cannot exceed half of your collateral amount.');
              } else {
                setBorrowError('');
              }
            }}
            sx={{ mb: 2, width: '300px' }}
          />
          {borrowError && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {borrowError}
            </Typography>
          )}
          {lenderValidationError && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {lenderValidationError}
            </Typography>
          )}
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleBorrowSubmit}
              disabled={
                !borrowAmount ||
                borrowAmount <= 0 ||
                !!borrowError ||
                !!lenderValidationError
              }
            >
              Submit
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}