import React, {useState, useRef} from 'react';
import { Outlet } from 'react-router-dom';
import { IconButton, Typography, Link as MuiLink, Tooltip, Button, Box, TextField, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Link } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import Popup from './components/Popup';
import { useReactToPrint } from 'react-to-print';
import Big from 'big.js';

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

const Layout = ({currentUser, signIn, signOut, clearMessage, message, 
                 onCreateProject, donationTarget, onDonate, setDonationTarget,
                printContent}) => {
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [printing, setPrinting] = useState(false);
  const printComponentRef = useRef();
  const pageStyle = `
  @page {
    margin: 50 !important;
  }

  @media all {
    .pagebreak {
      display: none;
    }
  }

  @media print {
    .pagebreak {
      page-break-before: always;
    }
  }
`;
  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    onAfterPrint: () => setPrinting(false),
    pageStyle: pageStyle
  });

  return (
    <>
      <div id="App">
          <main id="page-wrapper" className='flex flex-col justify-between h-full w-full'>
            <Outlet/>
            <Copyright/>
          </main>
          { currentUser
            ? <Box className='absolute top-0 right-0 m-2 flex flex-row'>
                {printContent && printContent.length > 0
                ?
                <Tooltip title={'Print a report of all your donations.'} arrow>
                  <Button onClick={_ => setPrinting(true)} size="large" className="my-2 mx-4">
                    Print Donation Report
                  </Button>
                </Tooltip>
                : null}
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
                    <Box component="form" onSubmit={onCreateProject} className="items-center align-middle flex flex-col">
                      <Typography variant="h4" component="h1" gutterBottom>Create a new Donation Project</Typography>
                      <Typography variant="body1" component="p" className='my-2'>Create a new donation project by filling all the details below.</Typography>
                      <TextField id="title" label="Title of the project" variant="outlined" className="my-4 self-center"
                                autoFocus required sx={{ minWidth: '700px' }}/>
                      <TextField id="description" label="A short description of the project" variant="outlined" className="my-4 self-center"
                                required multiline sx={{ minWidth: '700px' }}/>
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
                        <Button size='large' className="self-center mx-4" variant="outlined"
                                onClick={_ => setCreateDialogVisible(false)}>
                            Cancel
                        </Button>
                      </Box>
                  </Box>
                   }/>}

          {donationTarget && 
            <Popup handleClose={_ => setDonationTarget(null)}
                   content={
                    <Box component="form" onSubmit={onDonate} className="items-center align-middle flex flex-col">
                      <Typography variant="h4" component="h1" gutterBottom>Donate to {donationTarget.title}</Typography>
                      <Typography variant="body1" component="p" className='my-2'>Fill the amount you want to donate to the project.</Typography>
                      <TextField id="amount" label="The amount you wnat to donate in NEAR" variant="outlined" className="my-4 self-center"
                                autoFocus required sx={{ minWidth: '400px' }} type="text" 
                                inputProps={{ 
                                       inputMode: 'numeric', 
                                       pattern: '^-?\\d+(?:\\.\\d+)?$'
                                }}/>
                      <Box className='flex flex-row'>
                        <Tooltip title="Donate the specified amount." arrow className='mx-4'>
                            <Button size='large' className="self-center" variant="outlined"
                                    type="submit">
                                Donate
                            </Button>
                        </Tooltip>
                        <Button size='large' className="self-center mx-4" variant="outlined"
                                onClick={_ => setDonationTarget(null)}>
                            Cancel
                        </Button>
                      </Box>
                  </Box>
                   }/>}

          {printing && 
            <Popup handleClose={_ => setPrinting(false)}
                  content={
                    <Box>
                      <Box className='absolute top-0 right-0 m-2 flex flex-row'>
                        <Button onClick={handlePrint} size="large" className="my-2 mx-4">
                          Print
                        </Button>
                      </Box>
                      <Box className="p-5 flex flex-col" ref={printComponentRef}>
                        <Typography variant="h4" component="h1" gutterBottom className='my-6'>Donation Report</Typography>
                        <TableContainer component={Paper}>
                          <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                              <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Donation Project</TableCell>
                                <TableCell align="right">Donation (NEAR)</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {printContent.map((row) => (
                                <TableRow
                                  key={row.timestamp}
                                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                  <TableCell component="th" scope="row">
                                    {Date(row.timestamp)}
                                  </TableCell>
                                  <TableCell>
                                    <Link href={row.donation_project.homepage} target="_blank" rel="noopener">
                                        {row.donation_project.title}
                                    </Link>
                                  </TableCell>
                                  <TableCell align="right">{Big(row.donation).div(10 ** 24).toFixed(2)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Box>
                  }/>}
      </div>
    </>
  );
};

export default Layout;