// @mui

import Box from '@mui/material/Box';

import Footer from 'src/layouts/dashboard/footer';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// components
import { useSettingsContext } from 'src/components/settings';
import SubscriptionsAlert from 'src/sections/subscription-payment/alerts/subscription-alerts';

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
        <SubscriptionsAlert />
        {children}
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        minHeight: '100vh',
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
      <SubscriptionsAlert />
      <Box sx={{ mb: 2 }}>{children}</Box>
      <Box sx={{ mt: 'auto' }}>
        <Footer />
      </Box>
    </Box>
  );
}
