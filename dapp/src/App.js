import React, { useState, useEffect } from 'react';
import NotFound from './components/404.jsx';
import Dashboard from './components/Dashboard.jsx';
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
          if(result.status.SuccessValue){
            message = 'Successfully created new donation project.';
            //Trigger reload donation projects
          }
          else {
            message = 'Creating a donation project failed. Please try again.';
          }
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

  const onCreateProject = async (e) => {
    e.preventDefault();
    const { title, description, youtube, homepage } = e.target.elements;
    await contract.delete_donation_project({
      title: title.value,
      description: description.value,
      youtube_stream: youtube.value,
      homepage: homepage.value
    });
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
      <Route path="/" element={<Layout currentUser={currentUser} signIn={signIn} signOut={signOut} clearMessage={clearMessage} message={message}
                                        onCreateProject={onCreateProject}/>}>
        <Route index element={<Dashboard version={version}/>}/>
        <Route path="*" element={<NotFound/>}/>
      </Route>
    </Routes>
  );
}

export default App;
