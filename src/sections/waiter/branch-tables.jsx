import { useCallback } from 'react';
import { useParams } from 'react-router';
import { useMutation } from '@tanstack/react-query';

import { Box, Button, Avatar, useTheme } from '@mui/material';

import { blinkingBorder } from 'src/theme/css';
import { useAuthContext } from 'src/auth/hooks';
import { getOrderStatusStyle } from 'src/utils/get-order-status-styles';
import { useWaiterContext } from 'src/sections/waiter/context/waiter-context';

function BranchTables() {
  const theme = useTheme();
  const { waiterID, userID } = useParams();
  const { tables, setSelectedTable, selectedTable, branchInfo, setIsLoading } = useWaiterContext();
  const { activeOrders, fsInitiateNewOrder } = useAuthContext();

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

        if (isInKitchen.length === 0 && cart.length === 0 && isReadyToServe.length === 0)
          return {
            border: `solid 2px ${theme.palette.success.main}`,
            bgcolor: 'unset',
          };

        return {
          ...blinkingBorder(
            getOrderStatusStyle(isInKitchen.length !== 0, isReadyToServe.length !== 0, theme).color,
            tableInfo.docID
          ),
          bgcolor:
            selectedTable.docID === tableInfo.docID
              ? getOrderStatusStyle(isInKitchen.length !== 0, isReadyToServe.length !== 0, theme)
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
    mutationKey: ['active-orders', branchInfo.docID, userID],
    mutationFn: async (table) => {
      const { docID: tableID, menuID, branchID } = table;
      await fsInitiateNewOrder({
        initiatedBy: 'waiter',
        tableID,
        menuID,
        waiterID,
        userID,
        branchID,
      });
      return table;
    },
    onSuccess: (table) => {
      setSelectedTable(table);
    },
  });

  const onTableSelect = (table) => {
    const tableOrder = activeOrders.find((order) => order.tableID === table.docID);
    if (tableOrder) {
      setIsLoading(true);
      setTimeout(() => {
        setSelectedTable(table);
        setIsLoading(false);
      }, 500);
    }
    if (!tableOrder && table.isActive) mutate(table);
  };

  return (
    tables.length !== 0 && (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 1, p: 2 }}>
        {[...tables]
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
              <Button onClick={() => onTableSelect(table)} sx={{ color: 'text.primary' }}>
                {table.index}
              </Button>
            </Avatar>
          ))}
      </Box>
    )
  );
}
export default BranchTables;
