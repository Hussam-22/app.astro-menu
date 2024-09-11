import { Helmet } from 'react-helmet-async';

import TranslationSettingsView from 'src/sections/translation-settings/view/translation-settings-view';

function TranslationSettingsPage() {
  return (
    <>
      <Helmet>
        <title>Translation Settings</title>
      </Helmet>
      <TranslationSettingsView />
    </>
  );
}
export default TranslationSettingsPage;
