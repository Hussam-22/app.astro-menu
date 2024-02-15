import PropTypes from 'prop-types';

import { Box, Container } from '@mui/material';

import QrMenuHeader from 'src/layouts/qr-menu/header';
import BottomNavBar from 'src/layouts/qr-menu/bottom-nav-bar';

function QrMenuLayout({ children }) {
  return (
    <Box sx={{ bgcolor: 'background.light', minHeight: '100vh', py: 4, position: 'relative' }}>
      <QrMenuHeader />
      <Container maxWidth="sm" component="main" sx={{ py: 5 }}>
        {children}
        <BottomNavBar containerWidth={380} />
      </Container>
    </Box>
  );
}
export default QrMenuLayout;

QrMenuLayout.propTypes = { children: PropTypes.node };
