import { useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useTheme } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';

import { useAuthContext } from 'src/auth/hooks';
import { rdxGetBranchTables } from 'src/redux/slices/branch';
import TablesCard from 'src/sections/branches/components/TablesCard';
import OrdersListCard from 'src/sections/branches/components/OrdersListCard';
import SelectedTableInfoCard from 'src/sections/branches/components/SelectedTableInfoCard';
import TableInfoSkeleton from 'src/sections/branches/components/sekelton/table-info-sekeleton';

function BranchTables() {
  const theme = useTheme();
  const { id: branchID } = useParams();
  const { tables } = useSelector((state) => state.branch);
  const [selectedTable, setSelectedTable] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const { fsGetBranchTables } = useAuthContext();
  const dispatch = useDispatch();
  const [refreshTablesList, setRefreshTablesList] = useState(false);

  useEffect(() => {
    (async () => {
      dispatch(rdxGetBranchTables(await fsGetBranchTables(branchID)));
    })();
  }, [branchID, dispatch, fsGetBranchTables, refreshTablesList]);

  const handleOnTableClick = (table) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedTable(table);
      setIsLoading(false);
    }, 500);
  };

  const updateTablesListHandler = (keepMounted = false) => {
    if (!keepMounted) setSelectedTable(undefined);
    setRefreshTablesList((state) => !state);
  };

  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <TablesCard
          theme={theme}
          tables={tables}
          onTableClick={handleOnTableClick}
          onNewTableAdd={updateTablesListHandler}
        />
      </Grid>

      {isLoading && <TableInfoSkeleton />}
      {!isLoading && selectedTable && (
        <SelectedTableInfoCard table={selectedTable} updateTablesList={updateTablesListHandler} />
      )}
      {/* {selectedTable && <StatisticsOverviewCard tableID={selectedTable.id} branchID={selectedTable.branchID} />} */}
      {!isLoading && selectedTable && <OrdersListCard table={selectedTable} />}
    </Grid>
  );
}

export default BranchTables;
