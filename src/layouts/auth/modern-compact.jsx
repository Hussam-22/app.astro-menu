import PropTypes from 'prop-types';

// @mui
import Box from '@mui/material/Box';

//

// ----------------------------------------------------------------------

export default function AuthModernCompactLayout({ children }) {
  return (
    <Box
      component="main"
      sx={{
        py: 5,
        display: 'flex',
        minHeight: '50vh',
        height: 1,
        px: { xs: 2, md: 0 },
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        '&:before': {
          width: 1,
          height: 1,
          zIndex: -1,
          content: "''",
          opacity: 0.24,
          position: 'absolute',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundImage: 'url(/assets/background/overlay_4.jpg)',
        },
      }}
    >
      {children}
    </Box>
  );
}

AuthModernCompactLayout.propTypes = {
  children: PropTypes.node,
};
