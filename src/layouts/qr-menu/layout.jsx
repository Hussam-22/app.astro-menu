import PropTypes from 'prop-types';

import { Box, Container } from '@mui/material';

import QrMenuHeader from 'src/layouts/qr-menu/header';

function QrMenuLayout({ children }) {
  return (
    <Box sx={{ bgcolor: 'background.light', minHeight: '100vh', py: 4 }}>
      <QrMenuHeader />
      <Container maxWidth="sm" component="main" sx={{ py: 5 }}>
        {children}
      </Container>
    </Box>
  );
}
export default QrMenuLayout;

QrMenuLayout.propTypes = { children: PropTypes.node };
