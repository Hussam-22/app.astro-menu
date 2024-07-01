// import PropTypes from 'prop-types';

import { useMemo } from 'react';

import { Box, Stack, useTheme, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import FoodMenu from 'src/sections/waiter-staff-dashboard/food-menu';
import TableOrder from 'src/sections/waiter-staff-dashboard/table-order';
import MenuNavigation from 'src/sections/waiter-staff-dashboard/menu-navigation';
import TableActionBar from 'src/sections/waiter-staff-dashboard/table-action-bar';
import { useStaffContext } from 'src/sections/waiter-staff-dashboard/context/staff-context';
import TableOrderSkeleton from 'src/sections/waiter-staff-dashboard/components/table-order-skeleton';

function StaffView() {
  const theme = useTheme();
  const { activeOrders, staff } = useAuthContext();
  const { selectedTable: tableInfo, isLoading, selectedTable } = useStaffContext();

  const selectedTableOrder = useMemo(
    () => activeOrders.find((order) => order?.tableID === tableInfo?.docID),
    [activeOrders, tableInfo?.docID]
  );

  const orderInitiationTime =
    selectedTableOrder?.docID &&
    new Date(selectedTableOrder.initiationTime.seconds * 1000).toLocaleString('en-AE');

  if (isLoading) return <TableOrderSkeleton />;

  const tableOrder = (
    <Stack direction="column" spacing={2}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
        <Stack direction="column">
          <Typography variant="overline" color="primary">
            Table# {tableInfo?.index}
          </Typography>
          <Typography variant="caption">Note: {tableInfo.note}</Typography>
        </Stack>

        <Stack direction="column">
          <Typography variant="overline" color="primary">
            Order
          </Typography>
          <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
            {orderInitiationTime}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled', whiteSpace: 'nowrap' }}>
            {selectedTableOrder?.docID}
          </Typography>
        </Stack>
      </Stack>
      {staff?.type === 'waiter' && <TableActionBar />}
      <TableOrder />
    </Stack>
  );

  const foodMenu = (
    <FoodMenu
      menuID={
        selectedTableOrder?.cart?.length !== 0 && !selectedTable?.menuID
          ? selectedTableOrder?.menuID
          : selectedTable?.menuID
      }
    />
  );

  return (
    tableInfo?.docID &&
    selectedTableOrder &&
    !selectedTableOrder?.isCanceled &&
    !selectedTableOrder?.isPaid && (
      <>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: `dashed 2px ${theme.palette.divider}`,
          }}
        >
          {tableOrder}
        </Box>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: `dashed 2px ${theme.palette.divider}`,
          }}
        >
          {foodMenu}
        </Box>

        <MenuNavigation />
      </>
      // </Stack>
    )
  );
}
export default StaffView;
// StaffView.propTypes = { tables: PropTypes.array };
