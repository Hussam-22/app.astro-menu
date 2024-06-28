// import PropTypes from 'prop-types';

import { Box } from '@mui/material';

import Scrollbar from 'src/components/scrollbar';
import BranchTables from 'src/sections/waiter-staff-dashboard/branch-tables';
import { useStaffContext } from 'src/sections/waiter-staff-dashboard/context/staff-context';

function TablesColumn() {
  const { branchInfo } = useStaffContext();

  return (
    <Box component="nav">
      <Scrollbar
        sx={{
          height: 1,
          '& .simplebar-content': {
            height: 1,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <BranchTables />
      </Scrollbar>
    </Box>
  );
}
export default TablesColumn;
// TablesColumn.propTypes = { tables: PropTypes.array };
