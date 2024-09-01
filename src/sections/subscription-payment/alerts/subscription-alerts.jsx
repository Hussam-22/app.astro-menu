import { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Box, Alert, Stack, Container, Typography, AlertTitle } from '@mui/material';

import { delay } from 'src/utils/promise-delay';
import { useAuthContext } from 'src/auth/hooks';
import { useGetProductInfo } from 'src/hooks/use-get-product';
import { stripeCreatePortalSession } from 'src/stripe/functions';

export default function SubscriptionsAlert() {
  const { status } = useGetProductInfo();
  const [isLoading, setIsLoading] = useState(false);
  const {
    businessProfile: { ownerInfo },
  } = useAuthContext();

  const openPortalSession = async () => {
    setIsLoading(true);
    delay(1000);
    stripeCreatePortalSession(ownerInfo.email);
  };

  const subscriptionIssue = (
    <Alert severity="error" variant="outlined">
      <AlertTitle>Check your subscription</AlertTitle>
      <Typography>
        Your Subscription status is{' '}
        <Box component="span" sx={{ fontWeight: '600' }}>
          {status}
        </Box>
        , please renew your subscription to continue using the Astro-Menu, all services and QRs are
        disabled, customers cant view your menu
      </Typography>
      <LoadingButton
        loading={isLoading}
        variant="contained"
        color="secondary"
        onClick={openPortalSession}
        sx={{ fontWeight: 'bold' }}
      >
        Open Subscription Portal
      </LoadingButton>
    </Alert>
  );

  const trialPlan = (
    <Alert severity="info" variant="outlined">
      <AlertTitle>Enjoying Astro-Menu?</AlertTitle>
      <Typography>
        Subscribe to paid plan to continue using the Astro-Menu before trial ends, or switch to
        other plan that fits your business needs.
      </Typography>
      <LoadingButton
        loading={isLoading}
        variant="contained"
        color="info"
        onClick={openPortalSession}
        sx={{ fontWeight: 'bold', mt: 0.5 }}
        size="small"
      >
        Open Subscription Portal
      </LoadingButton>
    </Alert>
  );

  return (
    <Container maxWidth="lg" sx={{ mb: 3 }}>
      <Stack spacing={3}>
        {status !== 'active' && status !== 'trialing' && subscriptionIssue}
        {status === 'trialing' && trialPlan}
      </Stack>
    </Container>
  );
}
