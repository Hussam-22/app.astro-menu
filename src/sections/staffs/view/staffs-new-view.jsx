import { Container } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RoleBasedGuard } from 'src/auth/guard';
import { useSettingsContext } from 'src/components/settings';
import { useGetProductInfo } from 'src/hooks/use-get-product';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import StaffsNewEditForm from 'src/sections/staffs/staffs-new-edit-form';

function StaffsNewView() {
  const { isMenuOnly } = useGetProductInfo();
  const { themeStretch } = useSettingsContext();

  const role = isMenuOnly ? 'basic' : 'full';

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
