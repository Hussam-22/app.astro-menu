// import PropTypes from 'prop-types';

import { Box, useTheme } from '@mui/material';

import Scrollbar from 'src/components/scrollbar';
import BranchTables from 'src/sections/waiter-staff-dashboard/branch-tables';

function TablesColumn() {
  const theme = useTheme();
  return (
    <Box component="nav" sx={{ width: '14%' }}>
      <Scrollbar
        sx={{
          height: 1,
          '& .simplebar-content': {
            height: 1,
            display: 'flex',
            flexDirection: 'column',
          },
          bgcolor: 'background.paper',
          p: 2,
          borderRadius: 2,
          border: `dashed 2px ${theme.palette.divider}`,
          ml: 1,
        }}
      >
        <BranchTables />
      </Scrollbar>
    </Box>
  );
}
export default TablesColumn;
// TablesColumn.propTypes = { tables: PropTypes.array };
