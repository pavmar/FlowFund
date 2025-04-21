import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import axios from 'axios';
import { useSession } from '../SessionContext'; // Assuming you have a session context

export default function LenderActivatePage() {
  const { session } = useSession(); // Retrieve session data
  const email = session?.user?.email; // Get the logged-in user's email

  const [formData, setFormData] = React.useState({
    interest: '',
    amount: '',
    duration: '',
  });

  const [isLender, setIsLender] = React.useState(false);
  const [walletAddress, setWalletAddress] = React.useState<string | null>(null); // State for wallet address

  React.useEffect(() => {
    const fetchLenderDetails = async () => {
      if (!email) return;

      try {
        // Fetch wallet address directly from the User database
        const userResponse = await axios.get('http://localhost:9090/api/user/details', {
          params: { email },
        });

        const userWalletAddress = userResponse.data.walletAddress;
        setWalletAddress(userWalletAddress || null);

        // Fetch lender details
        const lenderResponse = await axios.get('http://localhost:9090/api/lender/details', {
          params: { email },
        });

        const { lender } = lenderResponse.data;

        if (!lender) {
          console.warn('No lender record found for this user.');
          setIsLender(false);
          return;
        }

        setIsLender(true);
        setFormData({
          interest: lender.interestRate?.toString() || '',
          amount: lender.minBorrowAmount?.toString() || '',
          duration: lender.durationDays?.toString() || '',
        });
      } catch (error: any) {
        console.error('Error fetching details:', error.response?.data || error.message);
      }
    };

    fetchLenderDetails();
  }, [email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert('User email not found in session.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:9090/api/lender/activate', {
        email,
        interestRate: parseFloat(formData.interest),
        durationDays: parseInt(formData.duration, 10),
        minBorrowAmount: parseFloat(formData.amount),
      });

      if (response.status === 200 || response.status === 201) {
        alert('Lender account updated successfully!');
      }
    } catch (error: any) {
      console.error('Error response from backend:', error.response?.data || error.message);
      alert(error.response?.data?.error || 'Failed to update lender account.');
    }
  };

  return (
    <Box
      component="form"
      sx={{ '& > :not(style)': { m: 1, width: '25ch' } }}
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <Box sx={{ mb: 2 }}>
        <strong>Account Address:</strong>{' '}
        {walletAddress ? walletAddress : 'Wallet is not connected'}
      </Box>
      <TextField
        id="interest"
        label="Interest"
        variant="filled"
        value={formData.interest}
        onChange={handleChange}
        required
      />
      <TextField
        id="amount"
        label="Amount"
        variant="filled"
        value={formData.amount}
        onChange={handleChange}
        required
      />
      <TextField
        id="duration"
        label="Duration"
        variant="filled"
        value={formData.duration}
        onChange={handleChange}
        required
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mt: 4,
          pr: 2,
        }}
      >
        <Button type="submit" variant="contained" color="primary">
          {isLender ? 'Update' : 'Submit'}
        </Button>
      </Box>
    </Box>
  );
}