import { useQuery } from '@tanstack/react-query';

import { Container } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useAuthContext } from 'src/auth/hooks';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import TranslationSettingsEditForm from 'src/sections/translation-settings/translation-settings-edit-form';

function TranslationSettingsView() {
  const { themeStretch } = useSettingsContext();
  const { businessProfile, fsGetBusinessProfile } = useAuthContext();
  const { data: translationSettingsInfo = {} } = useQuery({
    queryKey: ['businessProfile', businessProfile.docID],
    queryFn: () => fsGetBusinessProfile(businessProfile.docID),
  });

  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Manage Your Subscription & Payment Info"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Translation Settings' },
        ]}
      />
      <TranslationSettingsEditForm translationSettingsInfo={translationSettingsInfo} />
    </Container>
  );
}
export default TranslationSettingsView;
