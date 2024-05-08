import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';
import { useParams, useLocation } from 'react-router';

import { Box, useTheme, Container } from '@mui/material';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { blinkingElement } from 'src/theme/css';
// import QrMenuHeader from 'src/layouts/qr-menu/header';
import BottomNavBar from 'src/layouts/qr-menu/bottom-nav-bar';
import { getOrderStatusStyle } from 'src/utils/get-order-status-styles';
import { QrMenuContextProvider } from 'src/sections/qr-menu/context/qr-menu-context';

function QrMenuLayout({ children }) {
  const theme = useTheme();
  const { pathname } = useLocation();
  const { businessProfileID, branchID, tableID } = useParams();
  const { fsUpdateScanLog, orderSnapShot } = useAuthContext();

  const isMenu = pathname.endsWith('menu');

  const { mutate } = useMutation({
    mutationFn: () => fsUpdateScanLog(branchID, businessProfileID, tableID),
  });

  useEffect(() => {
    if (branchID && businessProfileID && tableID) mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const OrderIsInKitchen =
    orderSnapShot?.isInKitchen?.length !== 0 && orderSnapShot?.isReadyToServe?.length === 0;

  const orderIsReadyToServe = orderSnapShot?.isReadyToServe?.length !== 0;

  const orderStatus = getOrderStatusStyle(
    orderSnapShot?.isInKitchen?.includes(0),
    orderSnapShot?.isReadyToServe?.includes(0),
    theme
  );

  console.log(orderStatus);

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
          {(OrderIsInKitchen || orderIsReadyToServe) && (
            <Label
              variant="filled"
              color={orderStatus.labelColor}
              startIcon={<Iconify icon={orderStatus.icon} />}
              sx={{
                position: 'fixed',
                bottom: 80,
                left: '50%',
                transform: 'translateX(-50%)',
                borderRadius: 1,
                p: 2,
                ...blinkingElement,
              }}
            >
              {orderStatus.status}
            </Label>
          )}
          {isMenu && <BottomNavBar containerWidth={380} />}
        </Container>
      </QrMenuContextProvider>
    </Box>
  );
}
export default QrMenuLayout;

QrMenuLayout.propTypes = { children: PropTypes.node };
