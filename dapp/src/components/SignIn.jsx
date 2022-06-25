import React from 'react';
import { Button, Typography } from '@mui/material';

export default function SignIn({signIn, version}) {
  return (
    <>
      <div className="my-4">
        <Typography variant="h4" component="h1" gutterBottom>
          Simple Donations - {version}
        </Typography>
        <Typography variant="body1" component="p" className='mt-4 mb-2'>
            This app demonstrates how blockchain technology can be used to simplyfy and
            streamline the creation of donation projects. It allows the cash to reach
            the right places without any middle-man or delay. The only requirement is
            a working internet connection.
        </Typography>
        <Typography variant="body1" component="p" className='mt-4 mb-2'>
            Everyone with a NEAR wallet can create a new donation project with a simple
            click of a button in the top left corner. The user than provides information
            that shows the donors the credibility of the project like video links and 
            website links. Donors can then simply click on any project below to donate
            to them. In order to use the app you need to sign in with your NEAR wallet.
        </Typography>
        <Button vaiant="outlined" size='large' onClick={signIn}>Log in</Button>
      </div>
      
    </>
  );
}
