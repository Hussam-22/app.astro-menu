import PropTypes from 'prop-types';

import { Box, Stack, Button, Container, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import MenuNewEditForm from 'src/sections/menu/MenuNewEditForm';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

function MealNewView() {
  const { themeStretch } = useSettingsContext();

  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        sx={{ mb: 4 }}
        heading="Branches List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Branches',
            href: paths.dashboard.menu.list,
          },
          {
            name: 'New',
          },
        ]}
      />
      <MenuNewEditForm />
    </Container>
  );
}
export default MealNewView;
// MealNewView.propTypes = { tables: PropTypes.array };
