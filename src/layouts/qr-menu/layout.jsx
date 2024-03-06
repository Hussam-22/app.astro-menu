import PropTypes from 'prop-types';

import { Box, Container } from '@mui/material';

// import QrMenuHeader from 'src/layouts/qr-menu/header';
import BottomNavBar from 'src/layouts/qr-menu/bottom-nav-bar';
import { QrMenuContextProvider } from 'src/sections/qr-menu/context/qr-menu-context';

function QrMenuLayout({ children }) {
  return (
    <Box
      component="main"
      sx={{
        // bgcolor: 'background.neutral',
        height: 1,
      }}
    >
      <QrMenuContextProvider>
        {/* <QrMenuHeader /> */}
        <Container maxWidth="sm" component="main" sx={{ pt: 0, pb: 5 }}>
          {children}
          <BottomNavBar containerWidth={380} />
        </Container>
      </QrMenuContextProvider>
    </Box>
  );
}
export default QrMenuLayout;

QrMenuLayout.propTypes = { children: PropTypes.node };
