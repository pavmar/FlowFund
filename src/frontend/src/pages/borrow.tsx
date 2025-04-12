import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Card, CardContent, Button, Checkbox, FormControlLabel } from '@mui/material';
import axios from 'axios';

export default function BorrowPage() {
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

    try {
      const response = await axios.post('http://localhost:9090/api/borrow', {
        lenderId: selectedLender, // Only send the lenderId
      });

      if (response.status === 200) {
        alert('Borrow request submitted successfully!');
        setSelectedLender(null); // Clear the selection after submission
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
      <Grid container spacing={2}>
        {lenders.map((lender: any) => (
          <Grid item xs={12} sm={6} md={4} key={lender._id}>
            <Card sx={{ maxWidth: 345 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Interest Rate: {lender.interest}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Duration: {lender.duration} days
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Amount: {lender.amount} USD
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Collateral: {lender.collateral} USD
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
    //comment
  );
}