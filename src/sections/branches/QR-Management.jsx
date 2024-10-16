import { useState } from 'react';
// import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { Stack, Divider, useTheme } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import TablesCard from 'src/sections/branches/components/TablesCard';
import SelectedTableInfoCard from 'src/sections/branches/components/SelectedTableInfoCard';
import StatisticsOverviewCard from 'src/sections/branches/components/StatisticsOverviewCard';

const month = new Date().getMonth();
const year = new Date().getFullYear();

// QRManagement.propTypes = {
//   branchInfo: PropTypes.object,
// };

function QRManagement() {
  const theme = useTheme();
  const { id: branchID } = useParams();
  const { fsGetBranchTablesSnapshot, branchTables } = useAuthContext();
  const [selectedTable, setSelectedTable] = useState();

  const { data: branchTablesUnsubscribe = {}, error } = useQuery({
    queryKey: ['branch-tables-snapshot', branchID],
    queryFn: () => fsGetBranchTablesSnapshot(branchID),
  });

  const handleOnTableClick = (table) => setSelectedTable(table);

  return (
    <Stack direction="column" spacing={2}>
      <TablesCard
        theme={theme}
        tables={branchTables}
        onTableClick={handleOnTableClick}
        selectedTableID={selectedTable?.docID}
      />

      {selectedTable && (
        <StatisticsOverviewCard tableInfo={selectedTable} month={month} year={year} />
      )}

      {selectedTable && <SelectedTableInfoCard tableInfo={selectedTable} />}

      {selectedTable && selectedTable.index !== 0 && (
        <Divider sx={{ borderStyle: 'dashed', borderColor: theme.palette.divider }} />
      )}
    </Stack>
  );
}

export default QRManagement;
