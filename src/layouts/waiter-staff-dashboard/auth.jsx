import PropTypes from 'prop-types';

import { Box } from '@mui/material';

function StaffLoginLayout({ children }) {
  return (
    <Box
      sx={{ height: 1, width: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box
        sx={{
          width: { xs: '80%', sm: '65%', lg: '50%' },
          height: 400,
          borderRadius: 2,
          boxShadow: '5px 5px 0 #000',
          border: 'solid 3px #000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
export default StaffLoginLayout;
StaffLoginLayout.propTypes = { children: PropTypes.node };
