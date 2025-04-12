import * as React from 'react';
import { MetaMaskUIProvider } from '@metamask/sdk-react-ui';
import Metamask from './metamask';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function WalletPage() {
  const [balance, setBalance] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchBalance() {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        const balanceInWei = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [account, 'latest'],
        });
        const balanceInEth = parseFloat(window.web3.utils.fromWei(balanceInWei, 'ether')).toFixed(4);
        setBalance(balanceInEth);
      }
    }

    fetchBalance();
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
      <Box sx={{ marginTop: 4, padding: 2, border: '1px solid #ccc', borderRadius: 4 }}>
        <Typography variant="h6">Wallet Balance</Typography>
        {balance !== null ? (
          <Typography variant="body1">{balance} ETH</Typography>
        ) : (
          <Typography variant="body1">Fetching balance...</Typography>
        )}
      </Box>
    </MetaMaskUIProvider>
  );
}