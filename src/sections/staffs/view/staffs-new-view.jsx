import { Container } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useAuthContext } from 'src/auth/hooks';
import { RoleBasedGuard } from 'src/auth/guard';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import StaffsNewEditForm from 'src/sections/staffs/staffs-new-edit-form';

function StaffsNewView() {
  const { themeStretch } = useSettingsContext();
  const {
    businessProfile: { role },
  } = useAuthContext();

  return (
    <RoleBasedGuard hasContent roles={[role]} sx={{ py: 10 }}>
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
    </RoleBasedGuard>
  );
}
export default StaffsNewView;
