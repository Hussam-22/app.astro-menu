import { useParams } from 'react-router';
import { useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';

import { Box, Button, Avatar, useTheme } from '@mui/material';

import { blinkingBorder } from 'src/theme/css';
import { useAuthContext } from 'src/auth/hooks';
import { getOrderStatusStyle } from 'src/utils/get-order-status-styles';
import { useStaffContext } from 'src/sections/waiter-staff-dashboard/context/staff-context';

function BranchTables() {
  const theme = useTheme();
  const { staffID, businessProfileID } = useParams();
  const { setSelectedTable, selectedTable, branchInfo, setIsLoading } = useStaffContext();
  const { activeOrders, fsInitiateNewOrder, staff, branchTables } = useAuthContext();

  const isChef = staff?.type === 'chef';

  const getStyle = useCallback(
    (tableInfo) => {
      const { isActive } = tableInfo;
      const tableOrder = activeOrders.find((order) => order.tableID === tableInfo.docID);

      // TABLE IN-ACTIVE === RED
      if (!isActive)
        return {
          border: `solid 2px ${theme.palette.error.main}`,
          bgcolor: selectedTable.docID === tableInfo.docID ? 'error.main' : 'unset',
        };

      // TABLE IS ACTIVE WITHOUT ORDER === GREY
      if (isActive && !tableOrder)
        return {
          border: `solid 2px ${theme.palette.grey[500]}`,
          bgcolor: 'unset',
        };

      // TABLE ACTIVE WITH ORDER === BLINKING COLORS
      if (isActive && tableOrder) {
        const { isInKitchen, isReadyToServe, updateCount, cart } = tableOrder;

        if (isInKitchen?.length === 0 && isReadyToServe?.length === 0)
          return {
            border: `solid 2px ${theme.palette.success.main}`,
            bgcolor: 'unset',
          };

        return {
          ...blinkingBorder(
            getOrderStatusStyle(isInKitchen?.length !== 0, isReadyToServe?.length !== 0, theme)
              .color,
            tableInfo.docID
          ),
          bgcolor:
            selectedTable.docID === tableInfo.docID
              ? getOrderStatusStyle(isInKitchen?.length !== 0, isReadyToServe?.length !== 0, theme)
                  .color
              : 'unset',
        };
      }

      return {
        border: `solid 2px ${theme.palette.secondary.main}`,
        bgcolor: 'unset',
      };
    },
    [activeOrders, selectedTable.docID, theme]
  );

  const { mutate, error, isPending } = useMutation({
    mutationKey: ['active-orders', branchInfo.docID, businessProfileID],
    mutationFn: async (table) => {
      const { docID: tableID, menuID, branchID } = table;
      await fsInitiateNewOrder({
        initiatedBy: 'waiter',
        tableID,
        menuID,
        staffID,
        businessProfileID,
        branchID,
      });
      return table;
    },
    onSuccess: (table) => {
      setSelectedTable(table);
    },
  });

  useEffect(() => {
    const tableOrder = activeOrders.find((order) => order.tableID === selectedTable.docID);
    if (!tableOrder && selectedTable.isActive) mutate(selectedTable);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutate, selectedTable, isPending]);

  const onTableSelect = (table) => {
    setIsLoading(true);
    setSelectedTable(table);
    setIsLoading(false);
  };

  const ordersInKitchen = activeOrders.filter((order) => order?.isInKitchen?.length !== 0);

  const tablesWithInKitchenOrder = branchTables.filter((table) =>
    ordersInKitchen.some((order) => order.tableID === table.docID)
  );

  const tablesToShow = isChef
    ? tablesWithInKitchenOrder
    : branchTables.filter((table) => table.index !== 0);

  return (
    tablesToShow.length !== 0 && (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(25px, 1fr))',
          gap: 1.5,
          mt: 1,
        }}
      >
        {[...tablesToShow]
          .sort((a, b) => a.index - b.index)
          .map((table) => (
            <Avatar
              key={table.docID}
              variant="rounded"
              sx={{
                width: 32,
                height: 32,
                ...getStyle(table),
              }}
            >
              <Button
                onClick={() => onTableSelect(table)}
                sx={{ color: 'text.primary' }}
                disabled={!table.isActive}
              >
                {table.index}
              </Button>
            </Avatar>
          ))}
      </Box>
    )
  );
}
export default BranchTables;
