import { useState } from 'react';

import { Box, Button, Avatar, useTheme } from '@mui/material';

import { useWaiterContext } from 'src/sections/waiter/context/waiter-context';

function BranchTables() {
  const theme = useTheme();
  const { tables } = useWaiterContext();
  const [selectedTableID, setSelectedTableID] = useState('');

  const onTableClick = (tableInfo) => {};

  return (
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
              border: `2px solid ${
                table.isActive ? theme.palette.success.main : theme.palette.error.main
              }`,
              bgcolor:
                // eslint-disable-next-line no-nested-ternary
                selectedTableID === table.docID
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
  );
}
export default BranchTables;
BranchTables.propTypes = {};
