import PropTypes from 'prop-types';

// @mui
import Box from '@mui/material/Box';

import Header from 'src/layouts/dashboard/header';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
// components
import { useSettingsContext } from 'src/components/settings';

//
import Main from './main';
import NavMini from './nav-mini';
import NavVertical from './nav-vertical';

// ----------------------------------------------------------------------

export default function DashboardLayout({ children }) {
  const settings = useSettingsContext();
  const lgUp = useResponsive('up', 'lg');
  const nav = useBoolean();
  const isMini = settings.themeLayout === 'mini';

  const renderNavMini = <NavMini />;
  const renderNavVertical = <NavVertical openNav={nav.value} onCloseNav={nav.onFalse} />;

  if (isMini) {
    return (
      <Box
        sx={{
          minHeight: 1,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {lgUp ? renderNavMini : renderNavVertical}

        <Main>{children}</Main>
      </Box>
    );
  }

  return (
    <>
      {!lgUp && <Header onOpenNav={nav.onTrue} />}

      <Box
        sx={{
          minHeight: 1,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {renderNavVertical}

        <Main>{children}</Main>
      </Box>
    </>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node,
};
