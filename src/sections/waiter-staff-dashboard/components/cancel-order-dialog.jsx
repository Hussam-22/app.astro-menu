import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Stack, Button, Dialog, MenuItem, Typography, DialogContent } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { delay } from 'src/utils/promise-delay';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { useStaffContext } from 'src/sections/waiter-staff-dashboard/context/staff-context';

const CANCEL_REASONS = [
  'Order is Opened but Nothing Was Orders',
  'Incorrect Order was processed',
  'Customer Changed their mind',
  'Error in the system',
  'Customer Refused to Pay',
  'Other (Mention in Comment)',
];

DialogCancelOrder.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  payload: PropTypes.object,
  tableNo: PropTypes.number,
  closeText: PropTypes.string,
};

export default function DialogCancelOrder({ isOpen, onClose, tableNo, payload, closeText }) {
  const { fsUpdateOrderStatus } = useAuthContext();
  const { setSelectedTable } = useStaffContext();
  const { orderID, businessProfileID, branchID } = payload;
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

  const { handleSubmit } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: async (value) => {
      await delay(1000);

      await fsUpdateOrderStatus({
        orderID,
        businessProfileID,
        branchID,
        toUpdateFields: {
          cancelReason: value.reason,
          cancelComment: value.comment,
          closingTime: new Date(),
        },
      });

      // this will cause the snapshot to unsubscribe
      await fsUpdateOrderStatus({
        orderID,
        businessProfileID,
        branchID,
        toUpdateFields: {
          isCanceled: true,
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
            <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="center">
              <LoadingButton type="submit" variant="contained" color="error" loading={isPending}>
                Cancel Order
              </LoadingButton>
              <Button variant="contained" color="inherit" onClick={onClose}>
                {closeText}
              </Button>
            </Stack>
          </Stack>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
