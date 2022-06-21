import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from "react-router-dom";
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { StyledEngineProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import getConfig from './config.js';
import * as nearAPI from 'near-api-js';
//hack
import * as buffer from "buffer";
window.Buffer = buffer.Buffer;

// Initializing contracts
async function initContracts() {
  
  const nearConfig = getConfig(process.env.NEAR_ENV || 'testnet');
  const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
  const near = await nearAPI.connect({ keyStore, ...nearConfig });
  const walletConnection = new nearAPI.WalletConnection(near);
  
  let currentUser;
  if (walletConnection.getAccountId()) {
    currentUser = {
      accountId: walletConnection.getAccountId(),
      balance: (await walletConnection.account().state()).amount,
    };
  }

  const contract = await new nearAPI.Contract(
    walletConnection.account(),
    "main.cryptosketches.testnet",
    {
      viewMethods: [],
      changeMethods: ['sample_method'],
      sender: walletConnection.getAccountId(),
    }
  );
  
  const provider = near.connection.provider;
  
  return { contract, currentUser, nearConfig, walletConnection, provider };
}

window.nearInitPromise = initContracts().then(
  ({ contract, currentUser, nearConfig, walletConnection, provider }) => {
    let urlParams = new URLSearchParams(window.location.search);
    let lastTransaction;
    if(urlParams.has('transactionHashes')){
        lastTransaction = urlParams.get('transactionHashes');
    }
    let errorMessage;
    if(urlParams.has('errorMessage')){
        errorMessage = urlParams.get('errorMessage');
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <StyledEngineProvider injectFirst>
          <CssBaseline />
          <Router>
            <App
              contract={contract}
              currentUser={currentUser}
              nearConfig={nearConfig}
              wallet={walletConnection}
              lastTransaction={lastTransaction}
              provider={provider}
              error={errorMessage}
            />
          </Router>
        </StyledEngineProvider>
      </React.StrictMode>
    );

    // If you want to start measuring performance in your app, pass a function
    // to log results (for example: reportWebVitals(console.log))
    // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
    reportWebVitals();
  }
);
