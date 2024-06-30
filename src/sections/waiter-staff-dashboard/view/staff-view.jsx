// import PropTypes from 'prop-types';

import { useMemo } from 'react';

import { Box, Stack, useTheme, Typography } from '@mui/material';

import Image from 'src/components/image';
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
          <Typography variant="overline" color="primary">
            Table# {tableInfo?.index}
          </Typography>
          <Typography variant="caption" sx={{ color: 'warning.main' }}>
            {tableInfo.note}
          </Typography>
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
            minWidth: '40%',
            maxWidth: '40%',
            borderRadius: 2,
            bgcolor: 'background.paper',
            p: 2,
            border: `dashed 2px ${theme.palette.divider}`,
          }}
        >
          {tableOrder}
        </Box>
        <Box
          sx={{
            minWidth: '30%',
            maxWidth: '30%',
            borderRadius: 2,
            bgcolor: 'background.paper',
            p: 2,
            border: `dashed 2px ${theme.palette.divider}`,
          }}
        >
          {foodMenu}
        </Box>
        <Box
          sx={{
            minWidth: '10%',
            maxWidth: '10%',
            borderRadius: 2,
            bgcolor: 'background.paper',
            p: 2,
            border: `dashed 2px ${theme.palette.divider}`,
          }}
        >
          <MenuNavigation />
        </Box>
      </>
      // </Stack>
    )
  );
}
export default StaffView;
// StaffView.propTypes = { tables: PropTypes.array };
