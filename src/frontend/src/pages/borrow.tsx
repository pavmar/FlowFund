import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Card, CardContent, Button, TextField } from '@mui/material';
import axios from 'axios';
import { useSession } from '../SessionContext'; // Import the session context

export default function BorrowPage() {
  const { session } = useSession(); // Access the session
  const userEmail = session?.user?.email; // Retrieve the logged-in user's email

  const [lenders, setLenders] = React.useState([]);
  const [collateralAddress, setCollateralAddress] = React.useState<string | null>(null);
  const [collateralAmount, setCollateralAmount] = React.useState<number | null>(null);
  const [isEditingCollateral, setIsEditingCollateral] = React.useState(false);
  const [collateralError, setCollateralError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

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
  React.useEffect(() => {
    const fetchLenders = async () => {
      try {
        const response = await axios.get('http://localhost:9090/api/lenders'); // Backend endpoint to fetch lenders
        setLenders(response.data);
      } catch (error) {
        console.error('Error fetching lenders:', error);
        alert('Failed to fetch lenders. Please try again later.');
      }
    };

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
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}