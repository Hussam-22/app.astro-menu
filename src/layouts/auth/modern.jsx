import PropTypes from 'prop-types';

// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';

// components
import Logo from 'src/components/logo';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';

// ----------------------------------------------------------------------

export default function AuthModernLayout({ children, image }) {
  const upMd = useResponsive('up', 'md');

  const renderContent = (
    <Stack
      sx={{
        width: 1,
        mx: 'auto',
        maxWidth: 580,
        px: { xs: 2, md: 4 },
        bgcolor: { md: 'background.paper' },
      }}
    >
      <Logo
        sx={{
          mt: { xs: 2, md: 8 },
          mb: 2,
        }}
      />

      <Card
        sx={{
          py: { xs: 5, md: 0 },
          px: { xs: 3, md: 0 },
          boxShadow: { md: 'none' },
          overflow: { md: 'unset' },
        }}
      >
        {children}
      </Card>
    </Stack>
  );

  const renderSection = (
    <Stack flexGrow={1} sx={{ position: 'relative' }}>
      <Box
        component="img"
        alt="auth"
        src={image || '/assets/background/bg_register.jpg'}
        sx={{
          top: 16,
          left: 16,
          objectFit: 'cover',
          position: 'absolute',
          width: 'calc(100% - 32px)',
          height: 'calc(100% - 32px)',
          borderRadius: 3,
        }}
      />
    </Stack>
  );

  return (
    <Stack
      component="main"
      direction="row"
      sx={{
        minHeight: '100vh',
        position: 'relative',
        bgcolor: { md: 'background.paper' },
        // '&:before': {
        //   width: 1,
        //   height: 1,
        //   zIndex: -1,
        //   content: "''",
        //   position: 'absolute',
        //   backgroundSize: 'cover',
        //   opacity: { xs: 0.24, md: 0 },
        //   backgroundRepeat: 'no-repeat',
        //   backgroundPosition: 'center center',
        //   backgroundImage: 'url(/assets/background/overlay_4.jpg)',
        // },
      }}
    >
      {renderContent}

      {upMd && renderSection}
    </Stack>
  );
}

AuthModernLayout.propTypes = {
  children: PropTypes.node,
  image: PropTypes.string,
};
