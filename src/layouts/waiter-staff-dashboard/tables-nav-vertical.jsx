// import PropTypes from 'prop-types';

import { Box, Stack, Divider, Typography } from '@mui/material';

import Scrollbar from 'src/components/scrollbar';
import { STAFF_NAV } from 'src/layouts/config-layout';
import BranchTables from 'src/sections/waiter-staff-dashboard/branch-tables';
import { useStaffContext } from 'src/sections/waiter-staff-dashboard/context/staff-context';

function TablesNavVertical() {
  const { branchInfo } = useStaffContext();

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: STAFF_NAV.W_VERTICAL },
      }}
    >
      <Stack
        sx={{
          height: 1,
          position: 'fixed',
          width: STAFF_NAV.W_VERTICAL,
          borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
        }}
      >
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
          {/* <Logo sx={{ mt: 3, ml: 4, mb: 1 }} /> */}
          <Box
            sx={{
              px: 3,
              py: 4,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography variant="h5">{branchInfo.title}</Typography>
          </Box>
          <Divider sx={{ borderStyle: 'dashed' }} />
          <BranchTables />
          <Box sx={{ flexGrow: 1 }} />
        </Scrollbar>
      </Stack>
    </Box>
  );
}
export default TablesNavVertical;
// TablesNavVertical.propTypes = { tables: PropTypes.array };
