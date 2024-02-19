import PropTypes from 'prop-types';

import { Box, Container } from '@mui/material';

import QrMenuHeader from 'src/layouts/qr-menu/header';
import BottomNavBar from 'src/layouts/qr-menu/bottom-nav-bar';
import { QrMenuContextProvider } from 'src/sections/qr-menu/context/qr-menu-context';

function QrMenuLayout({ children }) {
  return (
    <Box
      // sx={{
      //   background:
      //     'linear-gradient(125deg, #FDFF9C 0%, #0500FF 100%), linear-gradient(180deg, #D3D3D3 0%, #161616 100%), linear-gradient(310deg, #00F0FF 0%, #00F0FF 20%, #0017E3 calc(20% + 1px), #0017E3 40%, #000F8F calc(40% + 1px), #000F8F 70%, #00073F calc(70% + 1px), #00073F 100%), linear-gradient(285deg, #FFB6B9 0%, #FFB6B9 35%, #FAE3D9 calc(35% + 1px), #FAE3D9 45%, #BBDED6 calc(45% + 1px), #BBDED6 65%, #61C0BF calc(65% + 1px), #61C0BF 100%)',
      //   backgroundBlendMode: 'overlay, overlay, exclusion, normal',
      //   minHeight: '100vh',
      //   py: 4,
      //   position: 'relative',
      // }}
      sx={{ bgcolor: 'background.neutral' }}
    >
      <QrMenuContextProvider>
        <QrMenuHeader />
        <Container maxWidth="sm" component="main" sx={{ py: 5 }}>
          {children}
          <BottomNavBar containerWidth={380} />
        </Container>
      </QrMenuContextProvider>
    </Box>
  );
}
export default QrMenuLayout;

QrMenuLayout.propTypes = { children: PropTypes.node };
