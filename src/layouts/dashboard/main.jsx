// @mui
import { useState } from 'react';

import Box from '@mui/material/Box';
import { LoadingButton } from '@mui/lab';
import { Alert, Container, AlertTitle } from '@mui/material';

import { delay } from 'src/utils/promise-delay';
import { useAuthContext } from 'src/auth/hooks';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// components
import { useSettingsContext } from 'src/components/settings';
import { useGetProductInfo } from 'src/hooks/use-get-product';
import { stripeCreatePortalSession } from 'src/stripe/functions';

//
import { NAV, HEADER } from '../config-layout';

// ----------------------------------------------------------------------

const SPACING = 13;

// eslint-disable-next-line react/prop-types
export default function Main({ children, sx, ...other }) {
  const settings = useSettingsContext();
  const lgUp = useResponsive('up', 'lg');
  const isNavHorizontal = settings.themeLayout === 'horizontal';
  const isNavMini = settings.themeLayout === 'mini';
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
    <Container maxWidth="lg" sx={{ mb: 3 }}>
      <Alert
        severity="error"
        variant="outlined"
        // onClose={() => setIsVisible(false)}
      >
        <AlertTitle>Check your subscription</AlertTitle>
        {`Your Subscription status is ${status}, please renew your subscription to continue using the Astro-Menu, all services and QRs are disabled, customers cant view your menu.`}
        <br />
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
    </Container>
  );

  const trialPlan = (
    <Container maxWidth="lg" sx={{ mb: 3 }}>
      <Alert
        severity="info"
        variant="outlined"
        // onClose={() => setIsVisible(false)}
      >
        <AlertTitle>Enjoying Astro-Menu?</AlertTitle>
        Subscribe to paid plan to continue using the Astro-Menu
        <br />
        <LoadingButton
          loading={isLoading}
          variant="contained"
          color="info"
          onClick={openPortalSession}
          sx={{ fontWeight: 'bold' }}
        >
          Open Subscription Portal
        </LoadingButton>
      </Alert>
    </Container>
  );

  if (isNavHorizontal) {
    return (
      <Box
        component="main"
        sx={{
          minHeight: 1,
          display: 'flex',
          flexDirection: 'column',
          pt: `${HEADER.H_MOBILE + 24}px`,
          pb: 10,
          ...(lgUp && {
            pt: `${HEADER.H_MOBILE * 2 + 40}px`,
            pb: 15,
          }),
        }}
      >
        {status !== 'Active' && subscriptionIssue}
        {children}
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        minHeight: 1,
        display: 'flex',
        flexDirection: 'column',
        py: `${HEADER.H_MOBILE + SPACING}px`,
        ...(lgUp && {
          px: 2,
          py: `${HEADER.H_DESKTOP + SPACING}px`,
          width: `calc(100% - ${NAV.W_VERTICAL}px)`,
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_MINI}px)`,
          }),
        }),
        ...sx,
      }}
      {...other}
    >
      {status !== 'Active' && status !== 'Trialing' && subscriptionIssue}
      {status === 'Trialing' && trialPlan}
      {children}
    </Box>
  );
}
