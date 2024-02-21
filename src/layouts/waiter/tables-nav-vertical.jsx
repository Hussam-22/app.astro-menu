// import PropTypes from 'prop-types';

import { Box, Stack, Avatar } from '@mui/material';

import { NAV } from 'src/layouts/config-layout';
import Scrollbar from 'src/components/scrollbar';
import { useWaiterContext } from 'src/sections/waiter/context/waiter-context';

function TablesNavVertical() {
  const { user, waiterInfo } = useWaiterContext();
  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_VERTICAL },
      }}
    >
      <Stack
        sx={{
          height: 1,
          position: 'fixed',
          width: NAV.W_VERTICAL,
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

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, p: 2 }}>
            {[...Array(50)].map((table, index) => (
              <Avatar key={index} />
            ))}
          </Box>

          <Box sx={{ flexGrow: 1 }} />
        </Scrollbar>
      </Stack>
    </Box>
  );
}
export default TablesNavVertical;
// TablesNavVertical.propTypes = { tables: PropTypes.array };
