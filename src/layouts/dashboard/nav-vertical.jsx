import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';

// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import { Button, Divider, Typography } from '@mui/material';

import Logo from 'src/components/logo';
// components
import SvgColor from 'src/components/svg-color';
import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';
import { useRouter, usePathname } from 'src/routes/hook';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// hooks
import { NavSectionVertical } from 'src/components/nav-section';

//
import { NAV } from '../config-layout';
import { NavToggleButton } from '../_common';

import { useNavData } from './config-navigation';

// ----------------------------------------------------------------------

export default function NavVertical({ openNav, onCloseNav }) {
  const pathname = usePathname();
  const router = useRouter();
  const lgUp = useResponsive('up', 'lg');
  const { enqueueSnackbar } = useSnackbar();
  const { logout, businessProfile } = useAuthContext();
  const navData = useNavData();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout!', { variant: 'error' });
    }
  };

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        pb: 3,
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="flex-start"
        sx={{ mt: 2, ml: 3 }}
      >
        <Stack direction="column" alignItems="flex-start" spacing={1}>
          <Logo sx={{ ml: -0.5 }} />
          <Typography sx={{ fontWeight: 600 }}>{businessProfile.ownerInfo.displayName}</Typography>
        </Stack>
      </Stack>

      <Divider sx={{ borderStyle: 'dashed', mb: 1 }} />

      <NavSectionVertical data={navData} />

      <Divider sx={{ borderStyle: 'dashed', my: 2 }} />
      <Box sx={{ mx: 2, mb: 2 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleLogout}
          endIcon={<SvgColor src="/assets/icons/system/logout.svg" />}
          fullWidth
        >
          Log Out
        </Button>
      </Box>

      <Box
        sx={{
          mx: 1,
          p: 2,
          bgcolor: 'background.default',
          borderRadius: 3,
          border: 'dashed 1px #C1C1C1',
        }}
      >
        <Typography variant="h6">Need Help ?</Typography>
        <Typography>
          Feel overwhelmed, need help in setting up your menu, we are here to help you, just send us
          an email and we will get in touch with you to assist you.
        </Typography>
        <Typography>hello@astro-menu.com</Typography>
      </Box>

      <Box sx={{ flexGrow: 1 }} />
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_VERTICAL },
        bgcolor: 'common.white',
      }}
    >
      <NavToggleButton />

      {lgUp ? (
        <Stack
          sx={{
            height: 1,
            position: 'fixed',
            width: NAV.W_VERTICAL,
            borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        >
          {renderContent}
        </Stack>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.W_VERTICAL,
              bgcolor: 'common.white',
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}

NavVertical.propTypes = {
  onCloseNav: PropTypes.func,
  openNav: PropTypes.bool,
};
