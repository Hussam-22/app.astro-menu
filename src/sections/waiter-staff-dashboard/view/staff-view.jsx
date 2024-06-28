// import PropTypes from 'prop-types';

import { useMemo } from 'react';

import { Box, Stack, Divider, Typography } from '@mui/material';

import Image from 'src/components/image';
import { useAuthContext } from 'src/auth/hooks';
import FoodMenu from 'src/sections/waiter-staff-dashboard/food-menu';
import TableOrder from 'src/sections/waiter-staff-dashboard/table-order';
import TableActionBar from 'src/sections/waiter-staff-dashboard/table-action-bar';
import MenuNavigation from 'src/sections/waiter-staff-dashboard/components/menu-navigation';
import { useStaffContext } from 'src/sections/waiter-staff-dashboard/context/staff-context';
import TableOrderSkeleton from 'src/sections/waiter-staff-dashboard/components/table-order-skeleton';

function StaffView() {
  const { activeOrders, staff, menuSections } = useAuthContext();
  const { selectedTable: tableInfo, isLoading, selectedTable } = useStaffContext();

  const selectedTableOrder = useMemo(
    () => activeOrders.find((order) => order?.tableID === tableInfo?.docID),
    [activeOrders, tableInfo?.docID]
  );

  const orderInitiationTime =
    selectedTableOrder?.docID &&
    new Date(selectedTableOrder.initiationTime.seconds * 1000).toLocaleString('en-AE');

  if (isLoading) return <TableOrderSkeleton />;

  if (!tableInfo?.docID && activeOrders.length === 0)
    return (
      <Box
        sx={{
          display: 'flex',
          m: 'auto',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: 'background.paper',
          p: 3,
          gap: 2,
          borderRadius: 3,
          boxShadow: '3px 3px 0 0 #000',
          border: 'solid 3px #000',
        }}
      >
        <Image src="/assets/icons/staff/coffee-love-icon.svg" sx={{ width: 250, height: 250 }} />
        <Typography variant="h4">All Looks Good, take a break!!</Typography>
      </Box>
    );

  const tableOrder = (
    <Stack direction="column" spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Stack direction="column">
          <Typography variant="overline">Table# {tableInfo?.index}</Typography>
          <Typography variant="caption" sx={{ color: 'error.main' }}>
            {tableInfo.note}
          </Typography>
        </Stack>

        <Stack direction="column">
          <Typography variant="overline">Order</Typography>
          <Typography variant="caption">{orderInitiationTime}</Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
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
      <Stack
        direction="row"
        spacing={2}
        divider={<Divider sx={{ border: '1px dashed', borderColor: 'divider' }} flexItem />}
      >
        <Box sx={{ width: '50%' }}>{tableOrder}</Box>
        <Box sx={{ width: '40%' }}>{foodMenu}</Box>
        <Box sx={{ width: '10%' }}>
          <MenuNavigation />
        </Box>
      </Stack>
    )
  );
}
export default StaffView;
// StaffView.propTypes = { tables: PropTypes.array };
