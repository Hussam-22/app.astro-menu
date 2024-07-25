// @mui
import { useSnackbar } from 'notistack';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Divider, IconButton, Typography } from '@mui/material';

// components
import Logo from 'src/components/logo';
// theme
import { hideScroll } from 'src/theme/css';
import { useRouter } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
import SvgColor from 'src/components/svg-color';
// hooks
import { NavSectionMini } from 'src/components/nav-section';

//
import { NAV } from '../config-layout';
import { NavToggleButton } from '../_common';

import { useNavData } from './config-navigation';

// ----------------------------------------------------------------------

export default function NavMini() {
  const navData = useNavData();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { logout } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout!', { variant: 'error' });
    }
  };

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_MINI },
        bgcolor: 'common.white',
      }}
    >
      <NavToggleButton
        sx={{
          top: 22,
          left: NAV.W_MINI - 12,
        }}
      />

      <Stack
        sx={{
          pb: 2,
          height: 1,
          position: 'fixed',
          width: NAV.W_MINI,
          borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          ...hideScroll.x,
        }}
      >
        <Logo sx={{ mx: 'auto', my: 2 }} />
        <Divider sx={{ borderStyle: 'dashed', mb: 1 }} />
        <NavSectionMini
          data={navData}
          config={{
            currentRole: 'admin',
          }}
        />
        <Divider sx={{ borderStyle: 'dashed', mb: 1 }} />
        <Stack
          direction="column"
          alignItems="center"
          justifyContent="center"
          sx={{ bgcolor: '#000000', color: '#FFFFFF', mx: 0.5, borderRadius: 1 }}
          onClick={handleLogout}
        >
          <IconButton variant="contained" color="secondary" sx={{ py: 0.5 }}>
            <SvgColor src="/assets/icons/system/logout.svg" sx={{ color: '#FFF' }} />
          </IconButton>
          <Typography variant="caption">Logout</Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
