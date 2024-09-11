import { useQuery } from '@tanstack/react-query';

import { Skeleton } from '@mui/lab';
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

  console.log(businessProfileInfo?.docID);

  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Manage Your Subscription & Payment Info"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Translation Settings' },
        ]}
      />
      {!businessProfileInfo?.docID && (
        <Skeleton animation="pulse" variant="rounded" width="100%" height={200} />
      )}
      <Stack direction="column" spacing={2}>
        {businessProfileInfo?.docID && (
          <DefaultLanguageEditForm businessProfileInfo={businessProfileInfo} />
        )}
        {businessProfileInfo?.docID && (
          <TranslationsListEditForm businessProfileInfo={businessProfileInfo} />
        )}
      </Stack>
    </Container>
  );
}
export default TranslationSettingsView;
