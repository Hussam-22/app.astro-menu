import { Button, Container } from '@mui/material';

import { paths } from 'src/routes/paths';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

function MenuListView() {
  const { themeStretch } = useSettingsContext();
  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Menus List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Menus List',
          },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            component={RouterLink}
            to={paths.dashboard.menu.new}
          >
            New Branch
          </Button>
        }
      />
    </Container>
  );
}
export default MenuListView;
// MenuListView.propTypes = { tables: PropTypes.array };
