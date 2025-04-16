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
    setShowBorrowForm(true); // Show the borrow form when a lender is selected
  };

  const handleBorrowSubmit = () => {
    if (!selectedLender) {
      alert('No lender selected.');
      return;
    }
  
    const lenderDetails = lenders.find((lender: any) => lender._id === selectedLender);
    if (!lenderDetails) {
      alert('Selected lender details not found.');
      return;
    }
  
    if (borrowAmount > lenderDetails.lendingAmountBalance) {
      alert('Borrow amount cannot exceed the lender\'s available balance.');
      return;
    }
  
    alert('Borrow request submitted successfully!');
    setBorrowAmount(''); // Clear the borrow amount after submission
    setShowBorrowForm(false); // Hide the borrow form after submission
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
                  Available Balance: {lender.lendingAmountBalance ?? 'N/A'} units
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
            onChange={(e) => setBorrowAmount(Number(e.target.value))}
            sx={{ mb: 2, width: '300px' }}
          />
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleBorrowSubmit}
              disabled={!borrowAmount || borrowAmount <= 0}
            >
              Submit
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}