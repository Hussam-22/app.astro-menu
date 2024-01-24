import { Container } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import MealNewEditForm from 'src/sections/meal/meal-new-edit-form';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

function MealNewView() {
  const { themeStretch } = useSettingsContext();

  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        sx={{ mb: 4 }}
        heading="Meals List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Meals',
            href: paths.dashboard.meal.list,
          },
          {
            name: 'New',
          },
        ]}
      />
      <MealNewEditForm />
    </Container>
  );
}
export default MealNewView;
// MealNewView.propTypes = { tables: PropTypes.array };
