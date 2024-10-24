import { Container } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import BranchNewEditForm from 'src/sections/branches/branch-new-edit-form';

function BranchNewView() {
  const { themeStretch } = useSettingsContext();

  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        sx={{ mb: 4 }}
        heading="Branches"
        links={[
          { name: 'Dashboard', href: paths.dashboard.branches.root },
          {
            name: 'Branches',
            href: paths.dashboard.branches.list,
          },
          {
            name: 'New',
          },
        ]}
      />
      <BranchNewEditForm />
    </Container>
  );
}
export default BranchNewView;
