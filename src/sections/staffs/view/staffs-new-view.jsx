import { Container } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import StaffsNewEditForm from 'src/sections/staffs/staffs-new-edit-form';

function StaffsNewView() {
  const { themeStretch } = useSettingsContext();

  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Add New Staff"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Staffs', href: paths.dashboard.staffs.list },
          { name: 'Add New Staff' },
        ]}
      />
      <StaffsNewEditForm />
    </Container>
  );
}
export default StaffsNewView;
