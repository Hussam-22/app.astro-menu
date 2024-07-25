// @mui
import Box from '@mui/material/Box';
import { Alert, Container, AlertTitle } from '@mui/material';

// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// components
import { useSettingsContext } from 'src/components/settings';
import { useGetProductInfo } from 'src/hooks/use-get-product';

//
import { NAV, HEADER } from '../config-layout';

// ----------------------------------------------------------------------

const SPACING = 0;

// eslint-disable-next-line react/prop-types
export default function Main({ children, sx, ...other }) {
  const settings = useSettingsContext();
  const lgUp = useResponsive('up', 'lg');
  const isNavHorizontal = settings.themeLayout === 'horizontal';
  const isNavMini = settings.themeLayout === 'mini';
  const { status } = useGetProductInfo();

  const subscriptionIssue = (
    <Container maxWidth="lg">
      <Alert
        severity="error"
        variant="outlined"
        // onClose={() => setIsVisible(false)}
      >
        <AlertTitle>Check your subscription</AlertTitle>
        {`Your Subscription status is ${status}, please renew your subscription to continue using the service`}
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
      {status !== 'Active' && subscriptionIssue}
      {children}
    </Box>
  );
}
