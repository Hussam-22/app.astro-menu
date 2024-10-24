/* eslint-disable no-unsafe-optional-chaining */
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { useTheme } from '@emotion/react';
import { useReactToPrint } from 'react-to-print';
import { useQuery } from '@tanstack/react-query';

import { Box, Stack, Button, Drawer, Divider, Typography, IconButton } from '@mui/material';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';
import { fDistance } from 'src/utils/format-time';
import OrderPrint from 'src/sections/orders/components/order-print';
import SendEmailTextBox from 'src/sections/orders/components/send-email-textbox';

// ----------------------------------------------------------------------

OrderDetailsDrawer.propTypes = {
  onClose: PropTypes.func,
  isOpen: PropTypes.bool,
  orderID: PropTypes.string,
  branchID: PropTypes.string,
};

function OrderDetailsDrawer({ onClose, isOpen, orderID, branchID }) {
  const theme = useTheme();
  const {
    fsGetBranch,
    fsGetStaffInfo,
    fsGetTableInfo,
    fsGetOrderByID,
    businessProfile: { businessName },
  } = useAuthContext();

  const printRef = useRef();

  const reactToPrintContent = () => printRef.current;

  const handlePrint = useReactToPrint({
    documentTitle: 'order-invoice',
  });

  const {
    data: orderInfo = {},
    isLoading,
    isFetched,
  } = useQuery({
    queryKey: ['order', orderID, branchID],
    queryFn: () => fsGetOrderByID(orderID, branchID),
    enabled: orderID !== undefined,
  });
  const { closingTime, initiationTime, totalBill, staffID, businessProfileID, tableID } = orderInfo;

  const { data: branchInfo = {} } = useQuery({
    queryKey: ['branch', orderInfo.branchID],
    queryFn: () => fsGetBranch(orderInfo.branchID),
    enabled: !!orderInfo?.docID,
  });

  const { data: staffInfo = {} } = useQuery({
    queryKey: ['staff', staffID],
    queryFn: () => fsGetStaffInfo(staffID),
    enabled: (orderInfo?.docID && staffID !== '') || staffID !== undefined,
  });

  const { data: tableInfo = [] } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [`table`, branchID, tableID],
    queryFn: () => fsGetTableInfo(businessProfileID, branchID, tableID),
    enabled: !!orderInfo?.docID,
  });

  const orderDate =
    typeof closingTime === 'string'
      ? // eslint-disable-next-line no-unsafe-optional-chaining
        new Date(initiationTime?.seconds * 1000)
      : // eslint-disable-next-line no-unsafe-optional-chaining
        new Date(closingTime?.seconds * 1000);

  const orderStatus = () => {
    if (orderInfo?.isPaid) return ['Paid', 'success'];
    if (orderInfo?.isCanceled) return ['Canceled', 'error'];
    return ['In Progress', 'default'];
  };

  const uniqueMealsIDs = [...new Set(orderInfo?.cart?.map((cartMeal) => cartMeal.mealID))];

  if (uniqueMealsIDs.length === 0) return null;

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '25px 0 0 25px',
          width: { xs: '85%', sm: '45%', md: '40%', lg: '35%' },
          p: 3,
        },
      }}
    >
      <Typography variant="h5">Order Details</Typography>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2">{orderInfo.docID}</Typography>
        <Stack direction="row" justifyContent="space-evenly" spacing={1} alignItems="center">
          <IconButton color="secondary" onClick={() => handlePrint(reactToPrintContent)}>
            <Iconify icon="fluent:print-32-regular" width={20} height={20} />
          </IconButton>
          <Label
            variant="soft"
            color={orderStatus()[1]}
            sx={{ textTransform: 'capitalize', fontSize: 16, p: 1 }}
          >
            {orderStatus()[0]}
          </Label>
        </Stack>
      </Stack>

      <Box>
        <Scrollbar sx={{ maxHeight: 300, my: 1 }}>
          <Box
            sx={{
              bgcolor: 'background.default',
              borderRadius: 1,
              p: 2,
              border: `dashed 1px ${theme.palette.grey[300]}`,
            }}
          >
            {uniqueMealsIDs.map((mealID) =>
              orderInfo.cart.slice(0, 1).map((cart) => (
                <React.Fragment key={cart.id}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: theme.typography.fontWeightBold }}
                    >
                      {cart?.title}
                    </Typography>
                    <Box sx={{ color: 'success.main', fontWeight: 700, typography: 'body2' }}>
                      x
                      {orderInfo.cart.filter((cartPortion) => cartPortion.mealID === mealID).length}
                    </Box>
                  </Stack>
                  <Box sx={{ ml: 1 }}>
                    {orderInfo.cart
                      .filter((cartPortion) => cartPortion.mealID === mealID)
                      .map((portion) => (
                        <Stack key={portion.id}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            sx={{
                              textDecorationLine: portion?.price === 0 ? 'line-through' : 'none',
                              textDecorationColor: theme.palette.error.main,
                              textDecorationThickness: 2,
                            }}
                          >
                            <Typography variant="body2" sx={{ flexGrow: 1 }}>
                              - {portion.portionSize}
                            </Typography>
                            <Typography variant="body2">
                              {portion.price} {branchInfo?.currency}
                            </Typography>
                          </Stack>
                          {portion?.comment && (
                            <Typography variant="caption" sx={{ ml: 2, color: 'error.main' }}>
                              *{portion.comment}
                            </Typography>
                          )}
                        </Stack>
                      ))}
                  </Box>

                  <Divider flexItem sx={{ borderStyle: 'dashed' }} />
                </React.Fragment>
              ))
            )}
          </Box>
        </Scrollbar>
      </Box>
      <Typography variant="h6" sx={{ textAlign: 'right', mt: 1.5 }}>
        Total Bill : {totalBill} {branchInfo?.currency}
      </Typography>
      <Divider flexItem sx={{ borderStyle: 'dashed', my: 1 }} />

      <SendEmailTextBox orderInfo={orderInfo} branchInfo={branchInfo} sx={{ py: 1 }} />
      <Stack>
        <Typography variant="caption">Order Date Time</Typography>
        <Typography variant="body2">{orderDate.toLocaleString()}</Typography>
      </Stack>
      {(initiationTime !== '' || closingTime !== '') && (
        <Stack>
          <Typography variant="caption">Turnover</Typography>
          <Typography variant="body2">
            {fDistance(
              initiationTime?.seconds ? new Date(initiationTime.seconds * 1000) : new Date(),
              closingTime?.seconds ? new Date(closingTime.seconds * 1000) : new Date()
            )}
          </Typography>
        </Stack>
      )}
      <Stack>
        <Typography variant="caption">Waitstaff</Typography>
        <Typography variant="body2">{staffInfo?.fullname || 'Self Order'}</Typography>
      </Stack>
      <Stack>
        <Typography variant="caption">Table #</Typography>
        <Typography variant="body2">{tableInfo?.index}</Typography>
      </Stack>
      {orderInfo.isCanceled && (
        <Stack>
          <Typography variant="caption">Cancelation Reason</Typography>
          <Typography variant="body2">{orderInfo.cancelReason}</Typography>

          <Typography variant="caption">Waitstaff Comment</Typography>
          <Typography variant="body2">{orderInfo.cancelComment || 'No Comment'}</Typography>
        </Stack>
      )}
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        <Button variant="soft" color="secondary" onClick={onClose}>
          Close
        </Button>
      </Box>

      <Box sx={{ display: 'none' }}>
        <OrderPrint
          ref={printRef}
          orderInfo={orderInfo}
          branchInfo={branchInfo}
          businessName={businessName}
        />
      </Box>
    </Drawer>
  );
}

export default OrderDetailsDrawer;
