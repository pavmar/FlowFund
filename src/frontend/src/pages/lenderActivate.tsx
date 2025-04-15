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
    collateral: '',
  });

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
        email, // Pass the user email
        interestRate: parseFloat(formData.interest),
        durationDays: parseInt(formData.duration, 10),
        minBorrowAmount: parseFloat(formData.amount),
      });
  
      if (response.status === 200) {
        alert('Lender activated successfully!');
        setFormData({ interest: '', amount: '', duration: '', collateral: '' }); // Clear form fields
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        alert('User not found. Please ensure the email is correct.');
      } else if (error.response && error.response.data.error) {
        alert(error.response.data.error); // Display the error message from the backend
      } else {
        console.error('Error activating lender:', error);
        alert('Failed to activate lender.');
      }
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
      <TextField
        id="collateral"
        label="Collateral"
        variant="filled"
        value={formData.collateral}
        onChange={handleChange}
        required
      />
      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
    </Box>
  );
}