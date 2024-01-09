import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { useSettingsContext } from 'src/components/settings';
// utils
import { localStorageGetItem } from 'src/utils/storage-available';

//
import { allLangs, defaultLang } from './config-lang';

// ----------------------------------------------------------------------

export default function useLocales() {
  const { i18n, t } = useTranslation();

  const settings = useSettingsContext();

  const langStorage = localStorageGetItem('i18nextLng');

  const currentLang = allLangs.find((lang) => lang.value === langStorage) || defaultLang;

  const onChangeLang = useCallback(
    (newlang) => {
      i18n.changeLanguage(newlang);
      settings.onChangeDirectionByLang(newlang);
    },
    [i18n, settings]
  );

  return {
    allLangs,
    t,
    currentLang,
    onChangeLang,
  };
}
