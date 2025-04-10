import * as React from 'react';
import { MetaMaskUIProvider } from '@metamask/sdk-react-ui';
import Metamask from './metamask';

export default function WalletPage() {
  
  return (    
    <MetaMaskUIProvider sdkOptions={{
      dappMetadata: {
        name: 'React Demo Button',
        url: 'http://reactdemobutton.localhost'
      },
      checkInstallationImmediately: false
    }}
    >
    <Metamask />
  </MetaMaskUIProvider>
  );
}
