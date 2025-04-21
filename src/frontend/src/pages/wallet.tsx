import * as React from 'react';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import { useSession } from '../SessionContext'; // Assuming you have a session context

export default function WalletPage() {
  const { session } = useSession(); // Get session details from context
  const email = session?.user?.email; // Extract email from session

  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserDetails() {
      if (!email) {
        setError('Email is required to fetch user details.');
        return;
      }

      try {
        // Fetch user details from the database
        const response = await axios.get('http://localhost:9090/api/user/details', {
          params: { email },
        });

        const { walletAddress, privateKey } = response.data;
        setWalletAddress(walletAddress || ''); // Set wallet address or leave empty
        setPrivateKey(privateKey || ''); // Set private key or leave empty
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError('Failed to fetch user details. Please try again.');
      }
    }

    fetchUserDetails();
  }, [email]);

  useEffect(() => {
    async function fetchBalance() {
      if (!walletAddress) {
        setError('Wallet address is required to fetch balance.');
        return;
      }

      try {
        // Use ethers.js to fetch the balance
        const provider = new ethers.providers.JsonRpcProvider(import.meta.env.VITE_REACT_APP_ETHEREUM_RPC_URL); // Replace with your RPC URL
        const balanceInWei = await provider.getBalance(walletAddress);
        const balanceInEth = ethers.utils.formatEther(balanceInWei);

        setBalance(parseFloat(balanceInEth).toFixed(4));
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Error fetching balance:', err);
        setError('Failed to fetch wallet balance. Please try again.');
      }
    }

    if (walletAddress) {
      fetchBalance();
    }
  }, [walletAddress]);

  async function updateUserDetails() {
    if (!email || !walletAddress || !privateKey) {
      setError('Email, wallet address, and private key are required.');
      return;
    }

    try {
      // Update the wallet address and private key in the user database
      await axios.post('http://localhost:9090/api/auth/updateUserDetails', {
        email,
        walletAddress,
        privateKey,
      });
      console.log('User details updated successfully in the database.');
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error updating user details in the database:', err);
      setError('Failed to update user details. Please try again.');
    }
  }

  return (
    <Box
      sx={{
        marginTop: 4,
        padding: 2,
        border: '1px solid #ccc',
        borderRadius: 4,
        maxWidth: 400,
        margin: 'auto',
        textAlign: 'left', // Align the box content to the left
      }}
    >
      <Typography variant="h6">Wallet Management</Typography>
      {error && (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      )}
      <Box sx={{ marginTop: 2 }}>
        <TextField
          label="Wallet Address"
          variant="outlined"
          fullWidth
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Private Key"
          variant="outlined"
          fullWidth
          type="password" // Hidden input for private key
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={updateUserDetails}
          sx={{ marginBottom: 2 }}
        >
          Update Details
        </Button>
        <Box
          sx={{
            marginTop: 2,
            padding: 2,
            border: '1px solid #ccc',
            borderRadius: 4,
            backgroundColor: '#f9f9f9',
          }}
        >
          <Typography variant="body1">
            <strong>Balance:</strong> {balance !== null ? `${balance} ETH` : 'Fetching...'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}