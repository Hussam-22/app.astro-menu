import { useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Box, Card, Stack, Typography } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { useWaiterContext } from 'src/sections/waiter/context/waiter-context';

function TableActionBar() {
  const { activeOrders, fsUpdateOrderStatus } = useAuthContext();
  const { selectedTable, setSelectedTable, user } = useWaiterContext();
  const orderSnapShot = activeOrders.find((order) => order.tableID === selectedTable.docID);

  const { mutate, isPending } = useMutation({
    mutationFn: (value) => {
      let field;
      if (value === 'CANCEL') field = { isCanceled: true };
      if (value === 'COLLECT') field = { isPaid: true };
      fsUpdateOrderStatus({ orderID, userID, branchID, toUpdateFields: field });
      return value;
    },
    onSuccess: (value) => {
      console.log(value);
      if (value !== 'KITCHEN') setSelectedTable({});
    },
  });

  const onOrderStatusUpdate = (field) => mutate(field);

  const orderValue = useMemo(
    () =>
      orderSnapShot?.docID &&
      orderSnapShot.cart.reduce((accumulator, portion) => accumulator + portion.price, 0),
    [orderSnapShot.cart, orderSnapShot?.docID]
  );

  const taxValue = +(orderValue * (user.taxValue / 100)).toFixed(2);
  const totalBill = +orderValue + taxValue;

  if (!orderSnapShot) return null;

  const {
    docID: orderID,
    userID,
    branchID,
    isPaid,
    isCanceled,
    isInKitchen,
    isReadyToServe,
    cart,
    updateCount,
  } = orderSnapShot;

  const isCancelOrderDisabled = cart.length === 0;
  const isCollectPaymentDisabled =
    cart.some((item) => item.update === updateCount) ||
    cart.length === 0 ||
    isInKitchen.length !== 0;

  console.log(isReadyToServe.includes(updateCount - 1));

  return (
    <Card sx={{ px: 2 }}>
      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={2}>
          <LoadingButton
            variant="soft"
            color="error"
            onClick={() => onOrderStatusUpdate('CANCEL')}
            startIcon={<Iconify icon="icon-park-twotone:close-one" />}
            disabled={isCancelOrderDisabled}
          >
            Cancel Order
          </LoadingButton>
          <LoadingButton
            variant="soft"
            color="success"
            onClick={() => onOrderStatusUpdate('COLLECT')}
            startIcon={<Iconify icon="ri:check-double-line" />}
            disabled={isCollectPaymentDisabled}
          >
            Collect Payment
          </LoadingButton>
        </Stack>

        <Stack direction="column" spacing={0} alignItems="flex-end" sx={{ my: 2 }}>
          <Typography variant="caption">
            Order : {orderValue}{' '}
            <Box component="span" sx={{ typography: 'caption' }}>
              AED
            </Box>
          </Typography>
          <Typography variant="caption">
            Tax({user.taxValue}%) : {taxValue}{' '}
            <Box component="span" sx={{ typography: 'caption' }}>
              AED
            </Box>
          </Typography>
          <Typography variant="h6" sx={{ color: 'success.main' }}>
            Total Bill : {totalBill}{' '}
            <Box component="span" sx={{ typography: 'caption', color: 'common.black' }}>
              AED
            </Box>
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
export default TableActionBar;
// TableActionBar.propTypes = { openDrawer: PropTypes.func };
