import { useState } from 'react';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { Stack, Divider, useTheme } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import TablesCard from 'src/sections/branches/components/TablesCard';
import OrdersListCard from 'src/sections/branches/components/OrdersListCard';
import SelectedTableInfoCard from 'src/sections/branches/components/SelectedTableInfoCard';
import StatisticsOverviewCard from 'src/sections/branches/components/StatisticsOverviewCard';

const month = new Date().getMonth();
const year = new Date().getFullYear();

function BranchTables() {
  const theme = useTheme();
  const { id: branchID } = useParams();
  const { fsGetBranchTables } = useAuthContext();

  const [selectedTable, setSelectedTable] = useState();

  const { data: tables = [] } = useQuery({
    queryKey: ['branch-tables', branchID],
    queryFn: () => fsGetBranchTables(branchID),
  });

  const handleOnTableClick = (table) => setSelectedTable(table);

  return (
    <Stack direction="column" spacing={2}>
      <TablesCard
        theme={theme}
        tables={tables}
        onTableClick={handleOnTableClick}
        selectedTableID={selectedTable?.docID}
      />

      {selectedTable && (
        <StatisticsOverviewCard tableInfo={selectedTable} month={month} year={year} />
      )}

      {selectedTable && (
        <SelectedTableInfoCard tableInfo={selectedTable} month={month} year={year} />
      )}

      {selectedTable && selectedTable.index !== 0 && (
        <Divider sx={{ borderStyle: 'dashed', borderColor: theme.palette.divider }} />
      )}

      {selectedTable && selectedTable.index !== 0 && <OrdersListCard tableInfo={selectedTable} />}
    </Stack>
  );
}

export default BranchTables;
