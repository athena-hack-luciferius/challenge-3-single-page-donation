import React, { useState, useEffect } from 'react';
import NotFound from './components/404.jsx';
import Dashboard from './components/Dashboard.jsx';
import Example from './components/Example.jsx';
import SignIn from './components/SignIn.jsx';
import Layout from './layout';
import Big from 'big.js';
import { Route, Routes } from 'react-router-dom'
var version = require('../package.json').version;

const BOATLOAD_OF_GAS = Big(3).times(10 ** 14).toFixed();

const App = ({ contract, currentUser, nearConfig, wallet, provider, lastTransaction, error }) => {
  const [message, setMessage] = useState('');
  
  useEffect(() => {
      if (error){
        setMessage(decodeURI(error));
        window.history.pushState({}, "", window.location.origin + window.location.pathname + window.location.hash);
      }
      else if (lastTransaction && currentUser) {          
        getState(lastTransaction, currentUser.accountId);
        window.history.pushState({}, "", window.location.origin + window.location.pathname + window.location.hash);
      }

      async function getState(txHash, accountId) {
        const result = await provider.txStatus(txHash, accountId);
        const receiver = result.transaction.receiver_id;
        const method = result.transaction.actions[0].FunctionCall.method_name;
        let message;

        if(receiver === contract.contractId && method === "sample_method"){
          //retrieve messages based on transaction details
          message = result.receipts_outcome[0].outcome.logs.pop();
        }
        if(!message){
          //some default fallback
          message = "The transaction was successfull";
        }
        if(message){
          setMessage(message);
        }
      }
  }, [lastTransaction, error, currentUser, provider, contract.contractId]);

  const onSampleMethod = () => {
    contract.sample_method(
      {
        //add arguments here in the format
        //<argument>: <value>
      },
      BOATLOAD_OF_GAS,
      Big(1).times(10 ** 14).toFixed() //attached deposit in yoctoNEAR
    ).then((_) => {
      //this is only executed if there is 0 deposit - for demonstartion purpose it is 1 here
    })
  }
  
  const signIn = () => {
    wallet.requestSignIn(
      {contractId: nearConfig.contractName, //contract requesting access 
       methodNames: [contract.sample_method.name]}, //used methods
      'NEAR Challenge #8 - DAO Dashboard', //optional name
      null, //optional URL to redirect to if the sign in was successful
      null //optional URL to redirect to if the sign in was NOT successful
    );
  };

  const signOut = () => {
    wallet.signOut();
    window.location.reload(false);
  };

  const clearMessage = () => {
    setMessage('');
  };

  //cleanup styles Login/Logout Button Popup close button, Copyright at bottom, Buttons filled
  //add github build script

  if(!currentUser){
    return (
      <Routes>
        <Route path="/" element={<Layout currentUser={currentUser} signIn={signIn} signOut={signOut} clearMessage={clearMessage} message={message}/>}>
          <Route index element={<SignIn signIn={signIn} version={version} />}/>
          <Route path="*" element={<SignIn signIn={signIn} version={version} />}/>
        </Route>
      </Routes>
    );
  }
  
  return (
    <Routes>
      <Route path="/" element={<Layout currentUser={currentUser} signIn={signIn} signOut={signOut} clearMessage={clearMessage} message={message}/>}>
        <Route index element={<Dashboard version={version}/>}/>
        <Route path="example" element={<Example onSampleMethod={onSampleMethod} />}/>
        <Route path="*" element={<NotFound/>}/>
      </Route>
    </Routes>
  );
}

export default App;
