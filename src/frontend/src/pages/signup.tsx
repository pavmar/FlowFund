import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { signUp } from '../firebase/auth'; // Ensure this function is implemented in your Firebase auth module
import { useNavigate } from 'react-router';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
  
    try {
      const result = await signUp(email, password);
      if (result?.success) {
        // Add user details to the backend
        const response = await fetch('http://localhost:9090/api/auth/addUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, fullName: 'New User' }), // Add fullName if needed
        });
  
        if (response.ok) {
          setSuccess(true);
          setError('');
          setTimeout(() => navigate('/sign-in'), 1000); // Redirect to sign-in page after 1 second
        } else {
          const errorText = await response.text();
          console.error('Failed to add user to the backend:', errorText);
          setError('Failed to register user in the backend');
        }
      } else {
        setError(result?.error || 'Failed to register');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        margin: 'auto',
        padding: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        alignItems: 'center',
      }}
    >
      <Typography variant="h4" gutterBottom>
        Sign Up
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">Registration successful! Redirecting...</Alert>}
      <TextField
        label="Email"
        type="email"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleRegister}
      >
        Register
      </Button>
      <Button
        variant="text"
        onClick={() => navigate('/sign-in')}
      >
        Already have an account? Sign In
      </Button>
    </Box>
  );
}