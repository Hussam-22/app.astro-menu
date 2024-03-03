import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Box, Card, Stack, Dialog, MenuItem, Typography, DialogContent } from '@mui/material';

import Iconify from 'src/components/iconify';
import { delay } from 'src/utils/promise-delay';
import { useAuthContext } from 'src/auth/hooks';
import { useWaiterContext } from 'src/sections/waiter/context/waiter-context';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

function TableActionBar() {
  const { activeOrders, fsUpdateOrderStatus } = useAuthContext();
  const { selectedTable, setSelectedTable, user } = useWaiterContext();
  const orderSnapShot = activeOrders.find((order) => order.tableID === selectedTable.docID);
  const [isOpen, setIsOpen] = useState(false);

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

  const { docID: orderID, userID, branchID, isInKitchen, cart, updateCount } = orderSnapShot;

  const isCancelOrderDisabled = cart.length === 0;
  const isCollectPaymentDisabled =
    cart.some((item) => item.update === updateCount) ||
    cart.length === 0 ||
    isInKitchen.length !== 0;

  return (
    <>
      <Card sx={{ px: 2 }}>
        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2}>
            <LoadingButton
              variant="soft"
              color="error"
              // onClick={() => onOrderStatusUpdate('CANCEL')}
              onClick={() => setIsOpen(true)}
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
      <DialogAddComment
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        tableNo={selectedTable.index}
        payload={{ orderID, userID, branchID }}
      />
    </>
  );
}
export default TableActionBar;
// TableActionBar.propTypes = { openDrawer: PropTypes.func };

const CANCEL_REASONS = [
  'Order is Opened but Nothing Was Orders',
  'Customer Changed their mind',
  'Error in the system',
  'Customer Refused to Pay',
  'Other (Mention in Comment)',
];
function DialogAddComment({ isOpen, onClose, tableNo, payload }) {
  const { fsUpdateOrderStatus } = useAuthContext();
  const { setSelectedTable } = useWaiterContext();
  const { orderID, userID, branchID } = payload;
  const defaultValues = useMemo(
    () => ({
      reason: CANCEL_REASONS[0],
      comment: '',
    }),
    []
  );

  const methods = useForm({
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    reset,
    formState: { isDirty, dirtyFields, errors },
  } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: async (value) => {
      await delay(1000);
      fsUpdateOrderStatus({
        orderID,
        userID,
        branchID,
        toUpdateFields: {
          isCanceled: true,
          cancelReason: value.reason,
          cancelComment: value.comment,
        },
      });
    },
    onSuccess: () => {
      setSelectedTable({});
    },
  });

  const onSubmit = async (data) => {
    mutate(data);
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={isOpen} onClose={onClose} scroll="paper">
      <DialogContent sx={{ p: 3 }}>
        <Stack direction="column">
          <Typography variant="caption">Table# {tableNo}</Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6">Order Cancelation Reason</Typography>
            <Iconify
              icon="ic:baseline-cancel"
              sx={{ color: 'error.main', width: 24, height: 24 }}
            />
          </Stack>
        </Stack>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack direction="column" spacing={2}>
            <RHFSelect name="reason" label="Cancel Reason">
              {CANCEL_REASONS.map((reason, index) => (
                <MenuItem key={index} value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFTextField name="comment" label="Comment (Optional)" multiline rows={2} />
            <Box sx={{ alignSelf: 'flex-end' }}>
              <LoadingButton type="submit" variant="contained" color="error" loading={isPending}>
                Cancel Order
              </LoadingButton>
            </Box>
          </Stack>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

DialogAddComment.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  payload: PropTypes.object,
  tableNo: PropTypes.number,
};
