import { useSelector } from 'react-redux';

import { Stack } from '@mui/material';

import { LANGUAGE_CODES } from 'src/locales/languageCodes';
import LanguageCard from 'src/components/translation-cards/LanguageCard';

function BranchTranslation() {
  const branchData = useSelector((state) => state.branch.branch);
  const languageKeys = Object.keys(branchData?.translationEdited || {});

  return (
    <Stack spacing={3}>
      {languageKeys
        .sort((a, b) => LANGUAGE_CODES[a].localeCompare(LANGUAGE_CODES[b]))
        .map((key) => (
          <LanguageCard
            languageKey={key}
            key={key}
            showTitleField={false}
            reduxSlice="branch"
            data={branchData}
          />
        ))}
    </Stack>
  );
}

export default BranchTranslation;
