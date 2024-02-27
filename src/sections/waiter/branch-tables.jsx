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
  const { tables, setSelectedTable, selectedTable, branchInfo } = useWaiterContext();
  const { activeOrders, fsInitiateNewOrder } = useAuthContext();

  const getStyle = useCallback(
    (tableInfo) => {
      // TABLE IN-ACTIVE === RED
      if (!tableInfo.isActive)
        return {
          border: `solid 2px ${theme.palette.error.main}`,
          bgcolor: selectedTable.docID === tableInfo.docID ? 'error.main' : 'unset',
        };

      // TABLE ACTIVE WITH ORDER === BLINKING COLORS
      if (tableInfo.isActive && activeOrders.length !== 0) {
        const tableOrder = activeOrders.find((order) => order.tableID === tableInfo.docID);
        if (!tableOrder) return { border: `solid 2px ${theme.palette.grey[200]}` };
        const { isInKitchen, isReadyToServe } = tableOrder;
        return {
          ...blinkingBorder(
            getOrderStatusStyle(isInKitchen, isReadyToServe, theme).color,
            tableInfo.docID
          ),
          bgcolor:
            selectedTable.docID === tableInfo.docID
              ? getOrderStatusStyle(isInKitchen, isReadyToServe, theme).color
              : 'unset',
        };
      }

      // TABLE IS ACTIVE WITHOUT ORDER === BLACK
      return {
        border: `solid 2px ${theme.palette.grey[500]}`,
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
    if (tableOrder) setSelectedTable(table);
    if (!tableOrder) mutate(table);
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
