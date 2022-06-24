import React, { useState, useEffect } from 'react';
import NotFound from './components/404.jsx';
import Dashboard from './components/Dashboard.jsx';
import SignIn from './components/SignIn.jsx';
import Layout from './layout';
import { Route, Routes } from 'react-router-dom'
import Big from 'big.js';

const BOATLOAD_OF_GAS = Big(3).times(10 ** 14).toFixed();
var version = require('../package.json').version;

const App = ({ contract, currentUser, nearConfig, wallet, provider, lastTransaction, error }) => {
  const [message, setMessage] = useState('');
  const [donationTarget, setDonationTarget] = useState();
  const [printContent, setPrintContent] = useState();
  
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

        if(receiver === contract.contractId && method === "create_donation_project"){
          if('SuccessValue' in result.status){
            message = 'Successfully created new donation project.';
          }
          else {
            message = 'Creating a donation project failed. Please try again.';
          }
        } else if(receiver === contract.contractId && method === "delete_donation_project"){
          if('SuccessValue' in result.status){
            message = 'Successfully deleted the donation project.';
          }
          else {
            message = 'Deleting the donation project failed. Please try again.';
          }
        } else if(receiver === contract.contractId && method === "donate"){
          if('SuccessValue' in result.status){
            message = 'The donation was successfull.';
          }
          else {
            message = 'The donation failed. Please try again.';
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
  
  useEffect(() => {
      async function fetchData() {
        if(currentUser && contract){
          const donations = await contract.get_donations({
            account_id: currentUser.accountId
          });
          console.log(donations);
          setPrintContent(donations);
        }
      }
      
      fetchData();
  }, [contract, currentUser]);

  const onCreateProject = async (e) => {
    e.preventDefault();
    const { title, description, youtube, homepage } = e.target.elements;
    await contract.create_donation_project({
      title: title.value,
      description: description.value,
      youtube_stream: youtube.value,
      homepage: homepage.value
    });
  }

  const onDeleteProject = async (project) => {
    await contract.delete_donation_project({
      project_id: project.id
    });
  }

  const onDonateOpen = (project) => {
    setDonationTarget(project);
  }

  const onDonate = async (e) => {
    e.preventDefault();
    const { amount } = e.target.elements;
    const payed = Big(amount.value).times(10 ** 24).toFixed()
    await contract.donate({
      donation_project: donationTarget
    },
    BOATLOAD_OF_GAS,
    payed
    );
  }
  
  const signIn = () => {
    wallet.requestSignIn(
      {contractId: nearConfig.contractName, //contract requesting access 
       methodNames: []}, //used methods
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
                                        onCreateProject={onCreateProject} donationTarget={donationTarget} onDonate={onDonate} 
                                        setDonationTarget={setDonationTarget} printContent={printContent}/>}>
        <Route index element={<Dashboard version={version} currentUser={currentUser} contract={contract} onDeleteProject={onDeleteProject} onDonate={onDonateOpen}/>}/>
        <Route path="*" element={<NotFound/>}/>
      </Route>
    </Routes>
  );
}

export default App;
