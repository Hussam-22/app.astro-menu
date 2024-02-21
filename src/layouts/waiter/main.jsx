import PropTypes from 'prop-types';

import { Box } from '@mui/material';

import { useResponsive } from 'src/hooks/use-responsive';

import { NAV } from '../config-layout';

function Main({ children }) {
  const lgUp = useResponsive('up', 'lg');
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        minHeight: 1,
        display: 'flex',
        flexDirection: 'column',
        py: `5px`,
        ...(lgUp && {
          px: 2,
          py: `5px`,
          width: `calc(100% - ${NAV.W_VERTICAL}px)`,
        }),
      }}
    >
      {children}
    </Box>
  );
}
export default Main;
Main.propTypes = { children: PropTypes.node };
