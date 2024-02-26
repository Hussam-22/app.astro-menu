import { useState, useEffect } from 'react';

import { Box, Button, Avatar, useTheme } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { useWaiterContext } from 'src/sections/waiter/context/waiter-context';

function BranchTables() {
  const theme = useTheme();
  const { tables, setSelectedTable, selectedTable, user, branchInfo } = useWaiterContext();
  const { fsOrderSnapshot, activeOrders, fsGetActiveOrdersSnapshot } = useAuthContext();
  const [unsubscribe, setUnsubscribe] = useState(null);
  // const { isInKitchen, isReadyToServe } = tables;

  // const getStatus = getOrderStatusStyle(isInKitchen, isReadyToServe, theme);
  console.log(activeOrders);

  // const { mutate } = useMutation({
  //   mutationFn: () => unsubscribe(),
  //   onSuccess: () => console.log('Unsubscribed Successfully !!'),
  // });

  useEffect(
    () => () => {
      // Unsubscribe when the component unmounts
      if (unsubscribe) {
        unsubscribe();
      }
    },
    [unsubscribe]
  );

  const onTableClick = async (tableInfo) => {
    const { userID, branchID, docID: tableID, menuID } = tableInfo;
    if (unsubscribe) {
      // If there's an existing subscription, unsubscribe before subscribing to the new table
      unsubscribe();
    }
    const newUnsubscribe = await fsOrderSnapshot({ userID, branchID, tableID, menuID });
    setUnsubscribe(() => newUnsubscribe);
    setSelectedTable(tableInfo);
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
                // border: `2px solid ${
                //   table.isActive ? theme.palette.success.main : theme.palette.error.main
                // }`,
                // ...(getStatus !== 'none' && { ...blinkingBorder(getStatus.color) }),
                bgcolor:
                  // eslint-disable-next-line no-nested-ternary
                  selectedTable.docID === table.docID
                    ? table.isActive
                      ? 'success.main'
                      : 'error.main'
                    : 'unset',
              }}
            >
              <Button onClick={() => onTableClick(table)} sx={{ color: 'text.primary' }}>
                {table.index}
              </Button>
            </Avatar>
          ))}
      </Box>
    )
  );
}
export default BranchTables;
