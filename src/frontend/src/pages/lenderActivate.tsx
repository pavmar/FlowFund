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
  const [contractBalance, setContractBalance] = React.useState<string>('0'); // State for contract balance
  const [withdrawAmount, setWithdrawAmount] = React.useState<string>(''); // State for withdrawal amount

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

        // Fetch contract balance
        const contractBalanceResponse = await axios.get(
          `http://localhost:9090/api/contract/balance/${lender.contractId}`
        );
        setContractBalance(contractBalanceResponse.data.balance);
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

  const handleWithdrawChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWithdrawAmount(e.target.value);
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(parseFloat(withdrawAmount)) || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid withdrawal amount');
      return;
    }

    try {
      const response = await axios.post('http://localhost:9090/api/lender/withdraw', {
        lenderEmail: email,
        amount: withdrawAmount,
      });

      if (response.status === 200) {
        alert('Funds withdrawn successfully!');
        setWithdrawAmount(''); // Clear the input field
        setContractBalance((prev) => (parseFloat(prev) - parseFloat(withdrawAmount)).toString()); // Update balance
      }
    } catch (error: any) {
      console.error('Error withdrawing funds:', error.response?.data || error.message);
      alert(error.response?.data?.error || 'Failed to withdraw funds.');
    }
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
      sx={{ '& > :not(style)': { m: 1, width: '100%' } }}
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <Box sx={{ mb: 2 }}>
        <strong>Account Address:</strong>{' '}
        {walletAddress ? walletAddress : 'Wallet is not connected'}
      </Box>

      {/* Update Contract Balance Section */}
      <Box
        sx={{
          mt: 4,
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '16px',
          width: '80%', // Increased width
          margin: '0 auto', // Center the box
        }}
      >
        <h3>Update Contract Balance</h3>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 2,
          }}
        >
          <Button type="submit" variant="contained" color="primary">
            {isLender ? 'Update' : 'Submit'}
          </Button>
        </Box>
      </Box>

      {/* Withdraw Funds Section */}
      <Box
        sx={{
          mt: 4,
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '16px',
          width: '80%', // Increased width
          margin: '0 auto', // Center the box
        }}
      >
        <h3>Contract Balance: {contractBalance} ETH</h3>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            id="withdrawAmount"
            label="Withdraw Amount"
            variant="filled"
            value={withdrawAmount}
            onChange={handleWithdrawChange}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={handleWithdraw}
          >
            Withdraw Funds
          </Button>
        </Box>
      </Box>
    </Box>
  );
}