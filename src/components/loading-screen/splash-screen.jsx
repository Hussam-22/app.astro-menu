import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import { Typography, CircularProgress } from '@mui/material';

import Logo from 'src/components/logo';
import { blinkingElement } from 'src/theme/css';

// ----------------------------------------------------------------------

export default function SplashScreen({ sx, ...other }) {
  const myStyle = {
    animation: 'upDownFade 3s infinite',
  };

  return (
    <Box
      sx={{
        width: 1,
        flexGrow: 1,
        minHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '95vh',
        flexDirection: 'column',
        gap: 1,
        ...sx,
      }}
      {...other}
    >
      <Box style={myStyle}>
        <Logo disabledLink sx={{ width: 64, height: 64 }} />
      </Box>
      <svg width={0} height={0}>
        <defs>
          <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
        </defs>
      </svg>
      <CircularProgress
        sx={{
          'svg circle': { stroke: 'url(#my_gradient)' },
          animationDuration: '400ms',
        }}
      />
      <Typography sx={{ ...blinkingElement }}>Loading Menu...</Typography>

      <style>
        {`
          @keyframes upDownFade {
            0% {
              transform: translateY(0);
              opacity: 1;
            }
            70% {
              transform: translateY(-20px);
              opacity: 1;
            }
            100% {
              transform: translateY(-20px);
              opacity: 0;
            }
          }
        `}
      </style>
    </Box>

    // <Box
    //   sx={{
    //     right: 0,
    //     width: 1,
    //     bottom: 0,
    //     height: 1,
    //     zIndex: 9998,
    //     display: 'flex',
    //     position: 'fixed',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     bgcolor: 'background.default',
    //     ...sx,
    //   }}
    //   {...other}
    // >
    //   <Box>
    //     <Logo disabledLink sx={{ width: 64, height: 64 }} />
    //   </Box>
    // </Box>
  );
}

SplashScreen.propTypes = {
  sx: PropTypes.object,
};
