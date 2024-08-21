import { useQuery } from '@tanstack/react-query';

import { Stack, Container } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useAuthContext } from 'src/auth/hooks';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import DefaultLanguageEditForm from 'src/sections/translation-settings/default-language-edit-form';
import TranslationsListEditForm from 'src/sections/translation-settings/translations-list-edit-form';

function TranslationSettingsView() {
  const { themeStretch } = useSettingsContext();
  const { businessProfile, fsGetBusinessProfile } = useAuthContext();

  const { data: businessProfileInfo = {} } = useQuery({
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
      <Stack direction="column" spacing={2}>
        <DefaultLanguageEditForm businessProfileInfo={businessProfileInfo} />
        <TranslationsListEditForm businessProfileInfo={businessProfileInfo} />
      </Stack>
    </Container>
  );
}
export default TranslationSettingsView;
