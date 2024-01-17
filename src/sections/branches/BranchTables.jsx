import { useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Grid, Skeleton, useTheme } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { rdxGetBranchTables } from 'src/redux/slices/branch';
import TablesCard from 'src/sections/branches/components/TablesCard';
import OrdersListCard from 'src/sections/branches/components/OrdersListCard';
import SelectedTableInfoCard from 'src/sections/branches/components/SelectedTableInfoCard';

function BranchTables() {
  const theme = useTheme();
  const { branchID } = useParams();
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
    }, 200);
  };

  const updateTablesListHandler = (keepMounted = false) => {
    if (!keepMounted) setSelectedTable(undefined);
    setRefreshTablesList((state) => !state);
  };

  return (
    <Grid container spacing={3}>
      <TablesCard
        theme={theme}
        tables={tables}
        onTableClick={handleOnTableClick}
        onNewTableAdd={updateTablesListHandler}
      />

      {isLoading && (
        <Grid item xs={12}>
          {/* <SkeletonProductDetails /> */}
          <Skeleton sx={{ width: 200, height: 200 }} />
        </Grid>
      )}
      {!isLoading && selectedTable && (
        <SelectedTableInfoCard table={selectedTable} updateTablesList={updateTablesListHandler} />
      )}
      {/* {selectedTable && <StatisticsOverviewCard tableID={selectedTable.id} branchID={selectedTable.branchID} />} */}
      {!isLoading && selectedTable && <OrdersListCard table={selectedTable} />}
    </Grid>
  );
}

export default BranchTables;
