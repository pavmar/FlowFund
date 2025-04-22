import * as React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import axios from 'axios';
import { useSession } from '../SessionContext';

export default function PaymentsPage() {
  const { session } = useSession();
  const userEmail = session?.user?.email;

  const [loanDetails, setLoanDetails] = React.useState<any>(null);
  const [repayAmount, setRepayAmount] = React.useState<number | ''>('');
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Fetch loan details
  React.useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        const response = await axios.get('http://localhost:9090/api/payments', {
          params: { userEmail },
        });
        setLoanDetails(response.data);
      } catch (error) {
        console.error('Error fetching loan details:', error);
        setError(error.response?.data?.error || 'Failed to fetch loan details.');
      }
    };

    if (userEmail) {
      fetchLoanDetails();
    }
  }, [userEmail]);

  // Handle repayment
  const handleRepay = async () => {
    if (!repayAmount || repayAmount <= 0) {
      setError('Please enter a valid repayment amount.');
      return;
    }

    if (repayAmount > loanDetails.totalAmountDue) {
      setError('Repayment amount cannot exceed the total amount due.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:9090/api/repay', {
        borrowerUserEmail: userEmail,
        repayAmount,
      });

      if (response.status === 200) {
        setSuccessMessage('Repayment successful!');
        setLoanDetails((prev: any) => ({
          ...prev,
          pendingAmount: prev.pendingAmount - repayAmount,
          totalAmountDue: prev.totalAmountDue - repayAmount,
        }));
        setRepayAmount('');
      }
    } catch (error) {
      console.error('Error processing repayment:', error);
      setError(error.response?.data?.error || 'Failed to process repayment.');
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Loan details
      </Typography>

      {error && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {successMessage && (
        <Typography variant="body2" color="success.main" sx={{ mb: 2 }}>
          {successMessage}
        </Typography>
      )}

      {loanDetails ? (
        <Box>
          <Box sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <Typography>Borrow Amount: {loanDetails.borrowAmount} ETH</Typography>
            <Typography>Pending Amount: {loanDetails.pendingAmount} ETH</Typography>
            <Typography>Interest: {loanDetails.interest.toFixed(4)} ETH</Typography>
            <Typography>Total Amount Due: {loanDetails.totalAmountDue.toFixed(4)} ETH</Typography>
            <Typography>Borrow Date: {new Date(loanDetails.borrowDate).toLocaleDateString()}</Typography>
            <Typography>Lender Email: {loanDetails.lenderEmail}</Typography>
          </Box>

          <TextField
            label="Repayment Amount"
            type="number"
            fullWidth
            margin="normal"
            value={repayAmount}
            onChange={(e) => setRepayAmount(Number(e.target.value))}
          />
          <Button variant="contained" color="primary" onClick={handleRepay}>
            Repay
          </Button>
        </Box>
      ) : (
        <Typography>No pending loans found.</Typography>
      )}
    </Box>
  );
}