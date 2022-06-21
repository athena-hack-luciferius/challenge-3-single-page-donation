import React from 'react';
import { Button, Typography } from '@mui/material';

const Example = ({onSampleMethod}) => {
   return <>
            <div className="my-4">
              <Typography variant="h4" component="h1" gutterBottom>
                Example page of the app
              </Typography>
              <p>
                  Here you can do something.
              </p>
              <Button size='large' className="self-center" variant="outlined" onClick={onSampleMethod}>Sample Method</Button>
            </div>
          </>
}

export default Example;