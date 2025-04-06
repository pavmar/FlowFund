import {
    MetaMaskButton, MetaMaskUIProvider, useAccount,
    useSDK,
    useSignMessage
  } from '@metamask/sdk-react-ui';
  
  import React from 'react';
  
  function MetaMaskReady() {
    const {
      data: signData,
      isError: isSignError,
      isLoading: isSignLoading,
      isSuccess: isSignSuccess,
      signMessage,
    } = useSignMessage({
      message: 'gm wagmi frens',
    });
  
    const { isConnected } = useAccount();
  
    return (
      <div className="App">
        <header className="App-header">
          <span>
            { /* TODO: Remove once we fix this issue */ }
          <p>Connect to MetaMask</p>
          </span>
          <MetaMaskButton theme={'light'} color="white"></MetaMaskButton>
          {isConnected && (
            <>
              <div style={{ marginTop: 20 }}>
                <button disabled={isSignLoading} onClick={() => signMessage()}>
                  Sign message
                </button>
                {isSignSuccess && <div>Signature: {signData}</div>}
                {isSignError && <div>Error signing message</div>}
              </div>
            </>
          )}
        </header>
      </div>
    );
  }
  
  export default function metamask() {
  
    const { ready } = useSDK();

    if (!ready) {
      return <div>Loading...</div>;
    }
  
    return <MetaMaskReady />;
  }
