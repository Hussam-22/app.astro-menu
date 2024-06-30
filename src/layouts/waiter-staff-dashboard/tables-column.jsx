// import PropTypes from 'prop-types';

import { Box, useTheme, Typography } from '@mui/material';

import Scrollbar from 'src/components/scrollbar';
import BranchTables from 'src/sections/waiter-staff-dashboard/branch-tables';

function TablesColumn() {
  const theme = useTheme();
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
          bgcolor: 'background.paper',
          py: 1,
          px: 2,
          borderRadius: 2,
          border: `dashed 2px ${theme.palette.divider}`,
        }}
      >
        <Typography variant="overline" color="primary" sx={{ ml: -1 }}>
          Branch Tables
        </Typography>
        <BranchTables />
      </Scrollbar>
    </Box>
  );
}
export default TablesColumn;
// TablesColumn.propTypes = { tables: PropTypes.array };
