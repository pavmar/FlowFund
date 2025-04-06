import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Grid2 } from '@mui/material';
import { Card, CardMedia } from '@mui/material';

export default function BorrowPage() {
  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
    <Grid2 container spacing={2}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={item}>
          <Card sx={{ maxWidth: 345 }}>
          <Typography variant="h6" gutterBottom>
            Lender  {item}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Description of item {item}.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Interest Rate: {item * 2}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Duration: {item * 10} days
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Amount: {item * 100} USD
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Collateral: {item * 50} USD
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Status: {item % 2 === 0 ? 'Available' : 'Pending'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Action: {item % 2 === 0 ? 'Borrow' : 'Pending'}
          </Typography>
          </Card>
          
        </Grid2>
      ))}
    </Grid2>
    </Box>
  );
}
