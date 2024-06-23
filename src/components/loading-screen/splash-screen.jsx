import { m } from 'framer-motion';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
// @mui
import { alpha } from '@mui/material/styles';

//
import Logo from '../logo';

// ----------------------------------------------------------------------

export default function SplashScreen({ sx, ...other }) {
  return (
    <Box
      sx={{
        right: 0,
        width: 1,
        bottom: 0,
        height: 1,
        zIndex: 9998,
        display: 'flex',
        position: 'fixed',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        ...sx,
      }}
      {...other}
    >
      <>
        <m.div
          animate={{
            scale: [1, 0.75, 0.75, 0.65],
            opacity: [1, 0.75, 0.5, 0],
            x: ['0%', '60%', '60%', '60%'],
            y: ['0%', '-60%', '-60%', '-60%'],
          }}
          transition={{
            duration: 2,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
          sx={{ opacity: 0.25 }}
        >
          <Logo disabledLink sx={{ width: 64, height: 64 }} />
        </m.div>

        <Box
          component={m.div}
          animate={{
            scale: [1, 1.2, 1.2, 1, 1],
            // rotate: [0, 270, 270, 0, 0],
            opacity: [1, 0.25, 0.25, 0.25, 1],
            borderRadius: ['25%', '25%', '50%', '50%', '25%'],
          }}
          transition={{
            ease: 'linear',
            duration: 1.2,
            repeat: Infinity,
          }}
          sx={{
            width: 120,
            height: 120,
            position: 'absolute',
            border: (theme) => `solid 3px ${alpha(theme.palette.primary.dark, 0.24)}`,
          }}
        />
      </>
    </Box>
  );
}

SplashScreen.propTypes = {
  sx: PropTypes.object,
};
