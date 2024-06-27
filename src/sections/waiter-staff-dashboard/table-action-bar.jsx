import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Box, Card, Stack, Typography } from '@mui/material';

import Iconify from 'src/components/iconify';
import { delay } from 'src/utils/promise-delay';
import { useAuthContext } from 'src/auth/hooks';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useStaffContext } from 'src/sections/waiter-staff-dashboard/context/staff-context';
import DialogCancelOrder from 'src/sections/waiter-staff-dashboard/components/cancel-order-dialog';

function TableActionBar() {
  const { activeOrders, fsUpdateOrderStatus, fsConfirmCartOrder } = useAuthContext();
  const { selectedTable, setSelectedTable, branchInfo } = useStaffContext();
  const orderSnapShot = activeOrders.find((order) => order.tableID === selectedTable.docID);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const orderValue = useMemo(
    () =>
      orderSnapShot?.docID &&
      orderSnapShot.cart.reduce((accumulator, portion) => accumulator + portion.price, 0),
    [orderSnapShot.cart, orderSnapShot?.docID]
  );

  const taxValue = +(orderValue * (branchInfo.taxValue / 100)).toFixed(2);
  const totalBill = orderValue + taxValue;

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      await delay(500);
      await fsConfirmCartOrder(orderSnapShot.cart, totalBill, branchID, businessProfileID);
      await fsUpdateOrderStatus({
        orderID,
        businessProfileID,
        branchID,
        toUpdateFields: { isPaid: true, totalBill, lastUpdate: new Date() },
      });
    },
    onSuccess: () => {
      setSelectedTable({});
    },
  });

  if (!orderSnapShot) return null;

  const {
    docID: orderID,
    businessProfileID,
    branchID,
    isInKitchen,
    cart,
    updateCount,
  } = orderSnapShot;

  const isCancelOrderDisabled = cart.length === 0;

  const isCollectPaymentDisabled =
    cart.some((item) => item.update === updateCount) ||
    cart.length === 0 ||
    isInKitchen.length !== 0;

  return (
    <>
      <Card sx={{ px: 2 }}>
        <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1}>
            <LoadingButton
              variant="soft"
              color="error"
              onClick={() => setIsCancelOpen(true)}
              startIcon={<Iconify icon="icon-park-twotone:close-one" />}
              disabled={isCancelOrderDisabled}
            >
              Cancel Order
            </LoadingButton>
            <LoadingButton
              variant="soft"
              color="success"
              // onClick={() => onOrderStatusUpdate('COLLECT')}
              onClick={() => setIsPaymentOpen(true)}
              startIcon={<Iconify icon="ri:check-double-line" />}
              disabled={isCollectPaymentDisabled}
            >
              Collect Payment
            </LoadingButton>
          </Stack>

          <Stack direction="column" spacing={0} alignItems="flex-end" sx={{ my: 2 }}>
            <Typography variant="caption">
              Order : {orderValue}{' '}
              <Box component="span" sx={{ fontSize: 9 }}>
                {branchInfo?.currency}
              </Box>
            </Typography>
            <Typography variant="caption">
              Tax({branchInfo?.taxValue}%) : {taxValue}{' '}
              <Box component="span" sx={{ fontSize: 9 }}>
                {branchInfo?.currency}
              </Box>
            </Typography>
            <Typography variant="h6" sx={{ color: 'success.main' }}>
              Total: {totalBill}{' '}
              <Box component="span" sx={{ fontSize: 9 }}>
                {branchInfo?.currency}
              </Box>
            </Typography>
          </Stack>
        </Stack>
      </Card>
      <DialogCancelOrder
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        tableNo={selectedTable.index}
        payload={{ orderID, businessProfileID, branchID }}
      />
      <ConfirmDialog
        title="Payment Confirmation"
        content="Are you sure you want to collect payment"
        action={
          <LoadingButton
            variant="contained"
            color="success"
            onClick={() => mutate()}
            loading={isPending}
          >
            Collect Payment
          </LoadingButton>
        }
        open={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        closeText="close"
      />
    </>
  );
}
export default TableActionBar;
// TableActionBar.propTypes = { openDrawer: PropTypes.func };
