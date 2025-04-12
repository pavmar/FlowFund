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
      const response = await axios.post('http://localhost:9090/api/lenderActivate', {
        email, // Send the email along with other form data
        ...formData,
      });

      if (response.status === 200) {
        alert('Details submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting details:', error);
      alert('Failed to submit details.');
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