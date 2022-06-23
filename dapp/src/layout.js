import React, {useState} from 'react';
import { Outlet } from 'react-router-dom';
import { IconButton, Typography, Link as MuiLink, Tooltip, Button, Box, TextField } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import Popup from './components/Popup';
import './burger-menu.css';

function Copyright() {
  return (
    <Typography variant="body1" color="text.secondary" align="center">
      {'Copyright © '}
      <MuiLink color="inherit" href="https://github.com">
        Your Website
      </MuiLink>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const Layout = ({currentUser, signIn, signOut, clearMessage, message, onCreateProject}) => {
  const [createDialogVisible, setCreateDialogVisible] = useState(false);

  return (
    <>
      <div id="App">
          <main id="page-wrapper" className='flex flex-col justify-between h-full p-5'>
            <Outlet/>
            <Copyright/>
          </main>
          { currentUser
            ? <Box className='absolute top-0 right-0 m-2 flex flex-row'>
                <Tooltip title={'Create a new donation project.'} arrow>
                  <Button onClick={_ => setCreateDialogVisible(true)} size="large" className="my-2 mx-4">
                    Create Donation Project
                  </Button>
                </Tooltip>
                <Tooltip title={'Log out ' + currentUser.accountId + '.'} arrow>
                  <IconButton onClick={signOut} size="large" className='m-2'>
                    <AccountBalanceWalletIcon fontSize="large" color='primary' />
                  </IconButton>
                </Tooltip>
              </Box>
            : <Tooltip title='Log in using NEAR wallet.' arrow>
                <IconButton onClick={signIn} size="large" className='absolute top-0 right-0 m-2'>
                  <BrokenImageIcon fontSize="large" color='primary' />
                </IconButton>
              </Tooltip>
          }
          {message && <Popup
            content={<>
              <Typography variant="h6" component="p" className='my-2'>Information</Typography>
              <div dangerouslySetInnerHTML={{__html: `${message}`}}/>
            </>}
            handleClose={clearMessage}
          />}
          {createDialogVisible && 
            <Popup handleClose={_ => setCreateDialogVisible(false)}
                   content={
                    <Box component="form" onSubmit={e => {
                        onCreateProject(e);
                      }} className="items-center align-middle flex flex-col">
                      <Typography variant="h4" component="h1" gutterBottom>Create a new Donation Project</Typography>
                      <Typography variant="body1" component="p" className='my-2'>Create a new donation project by filling all the details below.</Typography>
                      <TextField id="title" label="Title of the project" variant="outlined" className="my-4 self-center"
                                autoFocus required sx={{ minWidth: '700px' }}/>
                      <TextField id="description" label="A short description of the project" variant="outlined" className="my-4 self-center"
                                required sx={{ minWidth: '700px' }}/>
                      <TextField id="youtube" label="URL to an introduction youtube video. Should be in the form https://youtu.be/<VideoID>" variant="outlined" className="my-4 self-center"
                                 required sx={{ minWidth: '700px' }}/>
                      <TextField id="homepage" label="URL to the projects homepage" variant="outlined" className="my-4 self-center"
                                 required sx={{ minWidth: '700px' }}/>
                      <Box className='flex flex-row'>
                        <Tooltip title="Creates the project." arrow className='mx-4'>
                            <Button size='large' className="self-center" variant="outlined"
                                    type="submit">
                                Create
                            </Button>
                        </Tooltip>
                        <Tooltip title="Creates the project." arrow className='mx-4'>
                            <Button size='large' className="self-center" variant="outlined"
                                    onClick={_ => setCreateDialogVisible(false)}>
                                Cancel
                            </Button>
                        </Tooltip>
                      </Box>
                  </Box>
                   }/>}
      </div>
    </>
  );
};

export default Layout;