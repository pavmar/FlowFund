import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import axios from 'axios'; // Ensure axios is installed for API requests

export default function LenderActivatePage() {
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
    try {
      const response = await axios.post('/api/lenderActivate', formData); // Replace with your API endpoint
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
      />
      <TextField
        id="amount"
        label="Amount"
        variant="filled"
        value={formData.amount}
        onChange={handleChange}
      />
      <TextField
        id="duration"
        label="Duration"
        variant="filled"
        value={formData.duration}
        onChange={handleChange}
      />
      <TextField
        id="collateral"
        label="Collateral"
        variant="filled"
        value={formData.collateral}
        onChange={handleChange}
      />
      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
    </Box>
  );
}