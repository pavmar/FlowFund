import * as React from 'react';
import { MetaMaskUIProvider } from '@metamask/sdk-react-ui';
import Metamask from './metamask';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function WalletPage() {
  const [error, setError] = React.useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState<string | null>(null);

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
      <div>
        {error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <p>
            Balance of {walletAddress}: {balance !== null ? `${balance} ETH` : 'Fetching balance...'}
          </p>
        )}
      </div>
    </MetaMaskUIProvider>
  );
}