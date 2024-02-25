import { useMutation } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Card, Stack } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { ORDER_STATUS } from 'src/_mock/_order-status';

function TableActionBar() {
  const { orderSnapShot, fsUpdateOrderStatus } = useAuthContext();

  const currentStatusValue = orderSnapShot?.status?.at(-1)?.value || 0;
  const {
    color: statusColor,
    label: statusLabel,
    icon,
  } = ORDER_STATUS.find((item) => item.value === currentStatusValue + 1);

  const { mutate, error } = useMutation({
    mutationFn: () => {
      const { docID: orderID, userID, branchID } = orderSnapShot;
      if (orderSnapShot?.status.length === 0) {
        const status = [{ ...ORDER_STATUS[0], time: new Date() }];
        console.log(status);
        fsUpdateOrderStatus({ orderID, userID, branchID, status });
        return;
      }

      const nextValue = orderSnapShot.status.at(-1).value + 1;
      const nextStatus = ORDER_STATUS.find((statusItem) => statusItem.value === nextValue);
      const status = [...orderSnapShot.status, { ...nextStatus, time: new Date() }];
      fsUpdateOrderStatus({ orderID, userID, branchID, status });
    },
    onSuccess: () => {},
  });

  const onOrderStatusUpdate = () => mutate();

  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <LoadingButton
          variant="soft"
          color={statusColor}
          onClick={onOrderStatusUpdate}
          startIcon={<Iconify icon={icon} />}
        >
          {statusLabel}
        </LoadingButton>
      </Stack>
    </Card>
  );
}
export default TableActionBar;
// TableActionBar.propTypes = { openDrawer: PropTypes.func };
