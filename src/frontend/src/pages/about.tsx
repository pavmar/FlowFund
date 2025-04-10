import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function AboutPage() {
  return (
    <Box sx={{ padding: 2, lineHeight: 1.8 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to FlowFund!
      </Typography>
      <Typography variant="body1" paragraph>
        FlowFund is a decentralized lending platform that allows users to lend and borrow assets in a secure and efficient manner.
      </Typography>
      <Typography variant="body1" paragraph>
        Our mission is to provide a seamless experience for users to manage their assets and access liquidity when needed. We are committed to transparency, security, and innovation in the DeFi space.
      </Typography>
      <Typography variant="body1" paragraph>
        Built on the Ethereum blockchain, our platform ensures that all transactions are secure and verifiable. We believe in the power of decentralized finance to empower individuals and create a more inclusive financial system.
      </Typography>
      <Typography variant="body1" paragraph>
        Thank you for choosing FlowFund! If you have any questions or feedback, please feel free to reach out to us. We are always here to help and improve your experience.
      </Typography>
      <Typography variant="body1" paragraph>
        Stay tuned for more updates and features as we continue to grow and evolve. Together, we can build a better financial future.
      </Typography>
      <Typography variant="body1" paragraph>
        Happy lending and borrowing!
      </Typography>
      <Typography variant="h6" align="right">
        - The FlowFund Team
      </Typography>
    </Box>
  );
}