import * as React from 'react';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import axios from 'axios';
import { useSession } from '../SessionContext'; // Import the session context

export default function WalletPage() {
  const { session } = useSession(); // Access the session context
  const userEmail = session?.user?.email; // Retrieve the logged-in user's email

  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserWalletDetails() {
      console.log('User email from session:', userEmail); // Log the user email

      if (!userEmail) {
        setError('User email not found in session.');
        return;
      }

      try {
        const response = await axios.get('http://localhost:9090/api/user/walletDetails', {
          params: { email: userEmail },
        });

        const { walletAddress, walletBalance } = response.data;

        if (walletAddress) {
          setWalletAddress(walletAddress);
        }
        if (walletBalance) {
          setWalletBalance(walletBalance);
        }
      } catch (err) {
        console.error('Error fetching wallet details:', err);
        setError('Failed to fetch wallet details. Please try again.');
      }
    }

    fetchUserWalletDetails();
  }, [userEmail]);

  const handleStoreWalletDetails = async () => {
    if (!userEmail) {
      setErrorMessage('User email not found in session.');
      return;
    }

    if (!walletAddress || !privateKey) {
      setErrorMessage('Please fill in both wallet address and private key.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:9090/api/user/addWalletDetails', {
        email: userEmail, // Use the email from the session context
        walletAddress,
        privateKey,
      });

      setSuccessMessage('Wallet details stored successfully.');
      setErrorMessage(null);
    } catch (err) {
      console.error('Error storing wallet details:', err);
      setErrorMessage('Failed to store wallet details. Please try again.');
      setSuccessMessage(null);
    }
  };

  const handleSend = async () => {
    if (!sendAmount || isNaN(Number(sendAmount)) || Number(sendAmount) <= 0) {
      alert('Please enter a valid amount to send.');
      return;
    }
    if (!recipientAddress) {
      alert('Please enter a valid recipient address.');
      return;
    }

    try {
      const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545'); // Replace with your Infura project ID
      const wallet = new ethers.Wallet(privateKey, provider);
      const amountInWei = ethers.utils.parseEther(sendAmount);

      const tx = {
        to: recipientAddress,
        value: amountInWei,
      };

      const transactionResponse = await wallet.sendTransaction(tx);
      await transactionResponse.wait();

      alert(`Transaction successful! Hash: ${transactionResponse.hash}`);

      setSendAmount('');
      setRecipientAddress('');
    } catch (err) {
      console.error('Error sending transaction:', err);
      alert('Failed to send transaction. Please try again.');
    }
  };

  return (
    <>
      <Typography variant="h6">Wallet</Typography>

      {/* Wallet Details Section */}
      <Box
        sx={{
          marginBottom: 4,
          padding: 2,
          border: '1px solid #ccc',
          borderRadius: 4,
          textAlign: 'left',
        }}
      >
        {walletAddress ? (
          <>
            <Typography variant="body1">Address: {walletAddress}</Typography>
            <Typography variant="body1">Balance: {walletBalance || 'Fetching...'} ETH</Typography>
          </>
        ) : (
          <>
            <Typography variant="h6">Store Wallet Details</Typography>
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
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              sx={{ marginBottom: 2 }}
            />
            <Button variant="contained" color="primary" onClick={handleStoreWalletDetails}>
              Store Wallet Details
            </Button>
            {successMessage && (
              <Typography variant="body1" color="success" sx={{ marginTop: 2 }}>
                {successMessage}
              </Typography>
            )}
            {errorMessage && (
              <Typography variant="body1" color="error" sx={{ marginTop: 2 }}>
                {errorMessage}
              </Typography>
            )}
          </>
        )}
      </Box>

      {/* Send Ethereum Section */}
      <Box
        sx={{
          marginTop: 4,
          padding: 2,
          border: '1px solid #ccc',
          borderRadius: 4,
          textAlign: 'left',
        }}
      >
        <Typography variant="h6">Send Ethereum</Typography>
        <TextField
          label="Recipient Address"
          variant="outlined"
          fullWidth
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Amount to Send (ETH)"
          variant="outlined"
          fullWidth
          value={sendAmount}
          onChange={(e) => setSendAmount(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Button variant="contained" color="primary" onClick={handleSend}>
            Send
          </Button>
        </Box>
      </Box>
    </>
  );
}