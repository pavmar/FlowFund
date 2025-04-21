import * as React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import axios from 'axios';
import { useSession } from '../SessionContext'; // Import SessionContext
import { getAuth, updatePassword } from 'firebase/auth'; // Import Firebase Auth

export default function SettingsPage() {
  const { session } = useSession(); // Access session context
  const userEmail = session?.user?.email; // Get the user's email from the session
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');

  // Fetch user details from the database
  React.useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:9090/api/user/profile?email=${userEmail}`);
        const userData = response.data;

        setAddress(userData.address || ''); // Set address if available, else empty
        setPhoneNumber(userData.phoneNumber || ''); // Set phone number if available, else empty
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    if (userEmail) {
      fetchUserDetails();
    }
  }, [userEmail]);

  // Handle password update using Firebase Auth
  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        await updatePassword(user, newPassword);
        setError('');
        setSuccessMessage('Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError('No authenticated user found.');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setError('Failed to update password. Please try again.');
    }
  };

  // Handle address update
  const handleUpdateAddress = async () => {
    try {
      await axios.post('http://localhost:9090/api/user/updateAddress', {
        email: userEmail,
        address,
      });
      alert('Address updated successfully!');
    } catch (error) {
      console.error('Error updating address:', error);
      alert('Failed to update address.');
    }
  };

  // Handle phone number update
  const handleUpdatePhoneNumber = async () => {
    try {
      await axios.post('http://localhost:9090/api/user/updatePhoneNumber', {
        email: userEmail,
        phoneNumber,
      });
      alert('Phone number updated successfully!');
    } catch (error) {
      console.error('Error updating phone number:', error);
      alert('Failed to update phone number.');
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!userEmail) {
      alert('User email not found.');
      return;
    }

    const confirmDelete = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (!confirmDelete) return;

    try {
      // Call the backend to check for active loans and delete the user from the database
      const response = await axios.post('http://localhost:9090/api/user/deleteAccount', {
        email: userEmail,
      });

      if (response.status === 200) {
        // Delete the user from Firebase Authentication
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          await user.delete(); // Deletes the currently authenticated user
          alert('Account deleted successfully.');
          // Redirect or log out the user after account deletion
          window.location.href = '/'; // Example redirect to logout
        } else {
          alert('No authenticated user found.');
        }
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(error.response?.data?.error || 'Failed to delete account.');
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
        {successMessage && (
          <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
            {successMessage}
          </Typography>
        )}
      </Box>

      {/* Add Address */}
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="h6">Add Address</Typography>
        <TextField
          label="Address"
          fullWidth
          margin="normal"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdateAddress}
        >
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
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdatePhoneNumber}
        >
          Save Phone Number
        </Button>
      </Box>

      {/* Delete Account */}
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="h6" color="error">
          Delete Account
        </Typography>
        <Button variant="contained" color="error" onClick={handleDeleteAccount}>
          Delete My Account
        </Button>
      </Box>
    </Box>
  );
}