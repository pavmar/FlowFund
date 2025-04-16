import * as React from 'react';
import { MetaMaskUIProvider } from '@metamask/sdk-react-ui';
import Metamask from './metamask';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

export default function WalletPage() {
  const [error, setError] = React.useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState<string | null>(null);
  const [sendAmount, setSendAmount] = useState(''); // State to store the amount to send
  const [recipientAddress, setRecipientAddress] = useState(''); // State to store the recipient's wallet address

  useEffect(() => {
    async function fetchAccountsAndBalance() {
      if (!window.ethereum) {
        setError('MetaMask is not installed. Please install MetaMask and try again.');
        return;
      }

      try {
        // Request accounts from MetaMask
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setWalletAddress(account);

        // Use ethers.js to connect to the provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        // Fetch the balance of the connected account
        const balanceInWei = await provider.getBalance(account);
        const balanceInEth = ethers.utils.formatEther(balanceInWei);

        setBalance(parseFloat(balanceInEth).toFixed(4));
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Error fetching balance:', err);
        setError('Failed to fetch wallet balance. Please try again.');
      }
    }

    fetchAccountsAndBalance();
  }, []);

  const handleSend = () => {
    if (!sendAmount || isNaN(Number(sendAmount)) || Number(sendAmount) <= 0) {
      alert('Please enter a valid amount to send.');
      return;
    }
    if (!recipientAddress) {
      alert('Please enter a valid recipient address.');
      return;
    }
    alert(`Send functionality is not implemented yet. Amount: ${sendAmount} ETH, Recipient: ${recipientAddress}`);
  };

  const handleReceive = () => {
    alert(`Your wallet address is: ${walletAddress}`);
  };

  return (
    <MetaMaskUIProvider
      sdkOptions={{
        dappMetadata: {
          name: 'React Demo Button',
          url: 'http://reactdemobutton.localhost',
        },
        checkInstallationImmediately: false,
      }}
    >
      <Metamask />
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
        <Typography variant="h6">Wallet Balance</Typography>
        {error ? (
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        ) : balance !== null ? (
          <Typography variant="body1">{balance} ETH</Typography>
        ) : (
          <Typography variant="body1">Fetching balance...</Typography>
        )}
        <Box sx={{ marginTop: 2 }}>
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
            <Button variant="contained" color="secondary" onClick={handleReceive}>
              Receive
            </Button>
          </Box>
        </Box>
      </Box>
    </MetaMaskUIProvider>
  );
}