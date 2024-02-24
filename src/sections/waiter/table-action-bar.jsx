import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Card, Stack, Button } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { ORDER_STATUS } from 'src/_mock/_order-status';

function TableActionBar({ openDrawer }) {
  const { orderSnapShot, fsUpdateOrderStatus } = useAuthContext();

  const { mutate, error } = useMutation({
    mutationFn: () => {
      const { docID: orderID, userID, branchID } = orderSnapShot;
      if (orderSnapShot?.status.length === 0) {
        const status = [...orderSnapShot.status, { ...ORDER_STATUS[0], time: new Date() }];
        fsUpdateOrderStatus({ orderID, userID, branchID, status });
      }

      const nextValue = orderSnapShot.status.at(-1);
      const nextStatus = ORDER_STATUS.find((statusItem) => statusItem.value === nextValue);
      const status = [...orderSnapShot.status, { ...nextStatus, time: new Date() }];
      fsUpdateOrderStatus({ orderID, userID, branchID, status });
    },
    onSuccess: () => {},
  });

  console.log(error);

  const onOrderStatusUpdate = () => mutate();

  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <LoadingButton variant="soft" color="warning" onClick={onOrderStatusUpdate}>
          Status Update
        </LoadingButton>
        <Button
          variant="soft"
          color="info"
          startIcon={<Iconify icon="mdi:food-outline" />}
          onClick={openDrawer}
        >
          Open Menu
        </Button>
      </Stack>
    </Card>
  );
}
export default TableActionBar;
TableActionBar.propTypes = { openDrawer: PropTypes.func };
