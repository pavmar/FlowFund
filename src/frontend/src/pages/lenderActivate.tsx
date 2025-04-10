import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export default function LenderActivatePage() {
  

  return (
    <Box
      component="form"
      sx={{ '& > :not(style)': { m: 1, width: '25ch' } }}
      noValidate
      autoComplete="off"
    >
      <TextField id="filled-basic" label="Interest" variant="filled" />
      <TextField id="filled-basic" label="Amount" variant="filled" />
      <TextField id="filled-basic" label="Duration" variant="filled" />
      <TextField id="filled-basic" label="Collateral" variant="filled" />
    </Box>

  );
}
