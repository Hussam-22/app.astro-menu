import { useQuery } from '@tanstack/react-query';

import { useAuthContext } from 'src/auth/hooks';
import TranslationSettingsEditForm from 'src/sections/translation-settings/translation-settings-edit-form';

function TranslationSettingsView() {
  const { businessProfile, fsGetBusinessProfile } = useAuthContext();
  const { data: translationSettingsInfo = {} } = useQuery({
    queryKey: ['businessProfile', businessProfile.docID],
    queryFn: () => fsGetBusinessProfile(businessProfile.docID),
  });

  console.log(translationSettingsInfo);

  return <TranslationSettingsEditForm translationSettingsInfo={translationSettingsInfo} />;
}
export default TranslationSettingsView;
