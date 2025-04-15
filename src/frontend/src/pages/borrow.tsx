import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Card, CardContent, Button, Checkbox, FormControlLabel } from '@mui/material';
import axios from 'axios';
import { useSession } from '../SessionContext'; // Import the session context

export default function BorrowPage() {
  const { session } = useSession(); // Access the session
  const userEmail = session?.user?.email; // Retrieve the logged-in user's email

  const [lenders, setLenders] = React.useState([]);
  const [selectedLender, setSelectedLender] = React.useState<string | null>(null);

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

  const handleSelectLender = (lenderId: string) => {
    setSelectedLender(lenderId);
  };

  const handleBorrow = async () => {
    if (!selectedLender) {
      alert('Please select a lender to borrow from.');
      return;
    }
  
    if (!userEmail) {
      alert('User email not found. Please log in again.');
      return;
    }
  
    // Find the selected lender's details
    const lenderDetails = lenders.find((lender: any) => lender._id === selectedLender);
    if (!lenderDetails) {
      alert('Selected lender details not found.');
      return;
    }
  
    const amountToBorrow = lenderDetails.lendingTerms?.minBorrowAmount || 0; // Use the lender's minimum borrow amount
    const tenureDays = lenderDetails.lendingTerms?.durationDays || 0; // Use the lender's duration
    const interestRate = lenderDetails.lendingTerms?.interestRate || 0; // Use the lender's interest rate
    const collateralValue = 500; // Replace with the actual collateral value (if applicable)
  
    const borrowRequestPayload = {
      lenderId: selectedLender,
      borrowerEmail: userEmail,
      amount: amountToBorrow,
      interestRate,
      tenureDays,
      collateralValue,
      creditRating: 0, // Default value
      onTimePayments: 0, // Default value
      totalLogins: 0, // Default value
    };
  
    console.log('Borrow request payload:', borrowRequestPayload); // Log the payload
  
    try {
      const response = await axios.post('http://localhost:9090/api/borrow', borrowRequestPayload);
      console.log('Borrow response:', response.data); // Log the response
  
      if (response.status === 200) {
        alert('Borrow request submitted successfully!');
        console.log('Borrower details:', response.data.borrowerDetails); // Log borrower details
        setSelectedLender(null); // Clear the selection after submission
      }
    } catch (error) {
      console.error('Error submitting borrow request:', error); // Log the error
      alert('Failed to submit borrow request.');
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
                  Interest Rate: {lender.lendingTerms?.interestRate ?? 'N/A'}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Amount: {lender.lendingTerms?.minBorrowAmount ?? 'N/A'} USD
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Duration: {lender.lendingTerms?.durationDays ?? 'N/A'} days
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedLender === lender._id}
                      onChange={() => handleSelectLender(lender._id)}
                    />
                  }
                  label="Select"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleBorrow}
          disabled={!selectedLender}
        >
          Borrow
        </Button>
      </Box>
    </Box>
  );
}