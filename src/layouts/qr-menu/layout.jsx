import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';
import { useParams, useLocation } from 'react-router';

import { Box, Container } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
// import QrMenuHeader from 'src/layouts/qr-menu/header';
import BottomNavBar from 'src/layouts/qr-menu/bottom-nav-bar';
import { QrMenuContextProvider } from 'src/sections/qr-menu/context/qr-menu-context';

function QrMenuLayout({ children }) {
  const { pathname } = useLocation();
  const { businessProfileID, branchID, tableID } = useParams();
  const { fsUpdateScanLog } = useAuthContext();

  const isMenu = pathname.endsWith('menu');

  const { mutate } = useMutation({
    mutationFn: () => fsUpdateScanLog(branchID, businessProfileID, tableID),
  });

  useEffect(() => {
    if (branchID && businessProfileID && tableID) mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <Container maxWidth="sm" component="main" sx={{ pt: 0, pb: 5, px: 0 }}>
          {children}

          {isMenu && <BottomNavBar containerWidth={380} />}
        </Container>
      </QrMenuContextProvider>
    </Box>
  );
}
export default QrMenuLayout;

QrMenuLayout.propTypes = { children: PropTypes.node };
