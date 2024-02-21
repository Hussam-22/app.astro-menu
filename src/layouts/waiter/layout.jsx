import PropTypes from 'prop-types';

import { Box, Container } from '@mui/material';

import { QrMenuContextProvider } from 'src/sections/qr-menu/context/qr-menu-context';

function WaiterLayout({ children }) {
  return (
    <Box
      component="main"
      sx={{
        bgcolor: 'background.neutral',
        height: 1,
      }}
    >
      <QrMenuContextProvider>
        <Container maxWidth="xl" component="main" sx={{ py: 2 }}>
          {children}
        </Container>
      </QrMenuContextProvider>
    </Box>
  );
}
export default WaiterLayout;

WaiterLayout.propTypes = { children: PropTypes.node };
