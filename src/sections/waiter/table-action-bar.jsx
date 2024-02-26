import { useMutation } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Card, Stack } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';

function TableActionBar() {
  const { orderSnapShot, fsUpdateOrderStatus } = useAuthContext();
  const {
    docID: orderID,
    userID,
    branchID,
    isPaid,
    isCanceled,
    isInKitchen,
    isReadyToServe,
    cart,
  } = orderSnapShot;

  console.log({ isInKitchen });

  const isCancelOrderDisabled = cart.length === 0;
  const isCollectPaymentDisabled = !isReadyToServe;
  const isSendToKitchenDisabled = cart.length === 0 || isInKitchen;

  const { mutate, isPending } = useMutation({
    mutationFn: (value) => {
      let field;
      if (value === 'CANCEL') field = { isCanceled: true };
      if (value === 'COLLECT') field = { isPayed: true };
      if (value === 'KITCHEN') field = { isInKitchen: true };
      fsUpdateOrderStatus({ orderID, userID, branchID, toUpdateFields: field });
    },
    onSuccess: () => {},
  });

  const onOrderStatusUpdate = (value) => mutate(value);

  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} justifyContent="flex-end">
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
        <LoadingButton
          variant="soft"
          color="warning"
          onClick={() => onOrderStatusUpdate('KITCHEN')}
          startIcon={<Iconify icon="ph:cooking-pot-light" />}
          disabled={isSendToKitchenDisabled}
          loading={isPending}
        >
          Send to Kitchen
        </LoadingButton>
      </Stack>
    </Card>
  );
}
export default TableActionBar;
// TableActionBar.propTypes = { openDrawer: PropTypes.func };
