import * as React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

export default function SettingsPage() {
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleUpdatePassword = () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
    } else {
      setError('');
      // Add logic to handle password update
      console.log('Password updated successfully');
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        User Settings Page
      </Typography>

      {/* Change Password */}
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="h6">Change Password</Typography>
        <TextField
          label="New Password"
          type="password"
          fullWidth
          margin="normal"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={!!error}
          helperText={error}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdatePassword}
        >
          Update Password
        </Button>
      </Box>

      {/* Add Profile Picture */}
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="h6">Add Profile Picture</Typography>
        <Button variant="contained" component="label">
          Upload Picture
          <input type="file" hidden />
        </Button>
      </Box>

      {/* Add Address */}
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="h6">Add Address</Typography>
        <TextField
          label="Address"
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary">
          Save Address
        </Button>
      </Box>

      {/* Add Phone Number */}
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="h6">Add Phone Number</Typography>
        <TextField
          label="Phone Number"
          type="tel"
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary">
          Save Phone Number
        </Button>
      </Box>

      {/* Delete Account */}
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="h6" color="error">
          Delete Account
        </Typography>
        <Button variant="contained" color="error">
          Delete My Account
        </Button>
      </Box>
    </Box>
  );
}