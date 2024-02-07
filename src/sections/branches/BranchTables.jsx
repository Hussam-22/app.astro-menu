import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useTheme } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';

import { useAuthContext } from 'src/auth/hooks';
import TablesCard from 'src/sections/branches/components/TablesCard';
import SelectedTableInfoCard from 'src/sections/branches/components/SelectedTableInfoCard';
import TableInfoSkeleton from 'src/sections/branches/components/sekelton/table-info-sekeleton';

BranchTables.propTypes = { branchInfo: PropTypes.object };

function BranchTables({ branchInfo }) {
  const theme = useTheme();
  const { id: branchID } = useParams();
  const { fsGetBranchTables } = useAuthContext();
  const [selectedTable, setSelectedTable] = useState();

  const { data: tables = [], isFetching } = useQuery({
    queryKey: ['branch-tables', branchID],
    queryFn: () => fsGetBranchTables(branchID),
  });

  useEffect(() => {
    setSelectedTable(tables.find((table) => table.index === 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnTableClick = (table) => setSelectedTable(table);

  if (isFetching) return <TableInfoSkeleton />;

  return (
    <Grid container spacing={3}>
      <TablesCard
        theme={theme}
        tables={tables}
        onTableClick={handleOnTableClick}
        selectedTableID={selectedTable?.docID}
      />
      {selectedTable && <SelectedTableInfoCard table={selectedTable} />}
      {/* {selectedTable && <OrdersListCard table={selectedTable} />} */}

      {/* {selectedTable && <StatisticsOverviewCard tableID={selectedTable.id} branchID={selectedTable.branchID} />} */}
    </Grid>
  );
}

export default BranchTables;
